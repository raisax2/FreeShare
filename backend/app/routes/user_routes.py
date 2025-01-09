from flask import Blueprint, jsonify, request, current_app, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies, get_jwt_identity, decode_token
from bson.objectid import ObjectId
from datetime import timedelta, datetime
from email_validator import validate_email, EmailNotValidError
from jwt import ExpiredSignatureError, InvalidTokenError
import jwt
import base64
import os

users = Blueprint('users', __name__)

def is_valid_password(password):
    return len(password) >= 8

@users.route('/test-db', methods=['GET'])
def test_db_connection():
    try:
        db = current_app.db
        user_count = db['users'].count_documents({})
        return jsonify({'message': 'Database connection successful', 'user_count': user_count}), 200

    except Exception as e:
        return jsonify({'error': 'Database connection failed', 'details': str(e)}), 500

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@users.route('/signup', methods=['POST'])
def signup():
    db = current_app.db
    
    data = request.form.to_dict()
    email = data.get('email', '')
    password = data.get('password', '')
    user_type = data.get('userType', 'volunteer')
    
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({'error': 'Invalid email format', 'details': str(e)}), 400

    
    if db['users'].find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400

    
    if not is_valid_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    image_file = request.files.get('image')
    image_path = None

    if image_file:
        
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.save(image_path)

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user = {
        'email': email,
        'password': hashed_password,
        'userType': user_type,
        'image': image_path  
    }

    if user_type == 'volunteer':
        required_fields = ['fullName', 'dob', 'description']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        user.update({
            'fullName': data['fullName'],
            'dob': data['dob'],  
            'description': data['description']
        })

    elif user_type == 'organization':
        required_fields = ['organizationName', 'organizationDescription']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        user.update({
            'organizationName': data['organizationName'],
            'organizationDescription': data['organizationDescription']
        })

    try:
        db['users'].insert_one(user)
    except Exception as e:
        return jsonify({'error': 'Failed to insert user', 'details': str(e)}), 500

    return jsonify({'message': 'User registered successfully'}), 200

@users.route('/login', methods=['POST'])
def user_login():
    data = request.get_json()
    db = current_app.db

    user = db['users'].find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(hours=1))
    
    response = make_response(jsonify({
        'message': 'Login successful',
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'userType': 'volunteer'
        }
    }), 200)
    response.set_cookie('access_token_cookie', access_token, httponly=True, secure=False)
    response.set_cookie('user_type', 'volunteer', httponly=False, secure=False)

    return response

@users.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({'message': 'Logout successful'})
    
    unset_jwt_cookies(response)
    
    response.set_cookie('user_type', '', expires=0)
    return response, 200

@users.route('/get_user_by_id/<string:user_id>', methods=['GET'])
def get_profile_by_id(user_id):
    db = current_app.db

    try:
        user = db['users'].find_one({'_id': ObjectId(user_id)}, {'password': 0})
    except Exception:
        return jsonify({'error': 'Invalid user ID'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_response = {
        'id': str(user['_id']),
        'email': user['email'],
        'fullName': user.get('fullName', ''),
        'dob': user.get('dob', ''),
        'description': user.get('description', ''),
        'image': user.get('image', '')  
    }

    return jsonify({'user': user_response}), 200

@users.route('/update_profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    db = current_app.db

    data = request.form.to_dict()
    image_file = request.files.get('image')
    update_data = {}

    #user is no lonher able to update email or dob
    if 'description' in data:
        update_data['description'] = data['description']
    if 'fullName' in data:
        update_data['fullName'] = data['fullName']
    if image_file:
        try:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            update_data['image'] = image_data
        except Exception as e:
            return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500

    try:
        result = db['users'].update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
        if result.modified_count == 0:
            return jsonify({'message': 'No changes made'}), 200

        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500


@users.route('/delete_account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    db = current_app.db

    result = db['users'].delete_one({'_id': ObjectId(user_id)})

    if result.deleted_count == 0:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'User account deleted successfully'}), 200

@users.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    db = current_app.db

    reset_token = data.get('reset_token')
    new_password = data.get('new_password')

    try:
        decoded_token = decode_token(reset_token)
        user_id = decoded_token['sub']
    except Exception as e:
        return jsonify({'error': 'Invalid or expired token', 'details': str(e)}), 400

    if not is_valid_password(new_password):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db['users'].update_one({'_id': ObjectId(user_id)}, {'$set': {'password': hashed_password}})

    return jsonify({'message': 'Password updated successfully'}), 200

@users.route('/get_my_events', methods=['GET'])
@jwt_required()
def get_user_events():
    db = current_app.db
    user_id = get_jwt_identity()

    user = db['users'].find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "User not found"}), 404

    current_date = datetime.now().strftime('%Y-%m-%d')
    past_events = [event for event in user.get('events', []) if event['date'] < current_date]
    upcoming_events = [event for event in user.get('events', []) if event['date'] >= current_date]

    return jsonify({"past_events": past_events, "upcoming_events": upcoming_events}), 200


@users.route('/auth', methods=['GET'])
def auth():
    token = request.cookies.get('access_token_cookie')
    user_type = request.cookies.get('user_type')

    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded.get('sub')
        db = current_app.db

        
        if user_type == 'volunteer':
            user = db['users'].find_one({'_id': ObjectId(user_id)})
        elif user_type == 'organization':
            user = db['organizations'].find_one({'_id': ObjectId(user_id)})
        else:
            return jsonify({'error': 'Invalid user type'}), 400

        if user:
            return jsonify({
                'msg': 'Authenticated',
                'userType': user_type,
                'user': {
                    'id': str(user['_id']),
                    'email': user['email'],
                    'userType': user_type
                }
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Unauthorized - Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Unauthorized - Invalid token'}), 401