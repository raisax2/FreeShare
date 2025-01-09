from flask import Blueprint, jsonify, request, current_app, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies, get_jwt_identity, decode_token
from bson.objectid import ObjectId
from datetime import timedelta, datetime
from email_validator import validate_email, EmailNotValidError
import base64

organizations = Blueprint('organizations', __name__)

def is_valid_password(password):
    return len(password) >= 8

@organizations.route('/signup', methods=['POST'])
def signup():
    data = request.form.to_dict()  
    db = current_app.db

    try:
        validate_email(data.get('email', ''))
    except EmailNotValidError as e:
        return jsonify({'error': 'Invalid email format', 'details': str(e)}), 400

    if db['organizations'].find_one({'email': data.get('email')}):
        return jsonify({'error': 'Organization already exists'}), 400

    if not is_valid_password(data.get('password', '')):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    required_fields = ['name', 'description']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    image_file = request.files.get('image')
    if image_file:
        try:
            
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500
    else:
        image_data = None  

    organization = {
        'name': data['name'],
        'email': data['email'],
        'password': hashed_password,
        'description': data['description'],
        'address': data.get('address', ''),  
        'image': image_data,  
    }

    try:
        db['organizations'].insert_one(organization)
    except Exception as e:
        return jsonify({'error': 'Failed to insert organization', 'details': str(e)}), 500

    return jsonify({'message': 'Organization registered successfully'}), 200

@organizations.route('/login', methods=['POST'])
def organization_login():
    data = request.get_json()
    db = current_app.db

    organization = db['organizations'].find_one({'email': data['email']})
    if not organization or not check_password_hash(organization['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(organization['_id']), expires_delta=timedelta(hours=1))
    
    response = make_response(jsonify({
        'message': 'Login successful',
        'organization': {
            'id': str(organization['_id']),
            'email': organization['email'],
            'userType': 'organization'
        }
    }), 200)
    response.set_cookie('access_token_cookie', access_token, httponly=True, secure=False)
    response.set_cookie('user_type', 'organization', httponly=False, secure=False)

    return response

@organizations.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, 200

@organizations.route('/get_org_by_id/<org_id>', methods=['GET'])
@jwt_required()
def get_org_by_id(org_id):
    db = current_app.db

    try:
        organization = db['organizations'].find_one({'_id': ObjectId(org_id)})
    except Exception:
        return jsonify({'error': 'Invalid organization ID'}), 400

    if not organization:
        return jsonify({'error': 'Organization not found'}), 404

    return jsonify({
        'id': str(organization['_id']),
        'name': organization['name'],
        'email': organization['email'],
        'address': organization.get('address', ''),
        'description': organization.get('description', ''),
        'image': organization.get('image', '')  
    }), 200

@organizations.route('/get_all_orgs', methods=['GET'])
@jwt_required()
def get_all_orgs():
    db = current_app.db
    organizations = db['organizations'].find()

    all_orgs_list = []
    for organization in organizations:
        all_orgs_list.append({
            'id': str(organization['_id']),
            'name': organization['name'],
            'email': organization['email'],
            'address': organization.get('address', ''),
            'description': organization.get('description', ''),
        })

    return jsonify(all_orgs_list), 200

@organizations.route('/update_org', methods=['PUT'])
@jwt_required()
def update_org_profile():
    org_id = get_jwt_identity()
    db = current_app.db

    data = request.form.to_dict()
    image_file = request.files.get('image')
    update_data = {}
    
    if 'email' in data:
        try:
            validate_email(data['email'])
            update_data['email'] = data['email']
        except EmailNotValidError as e:
            return jsonify({'error': 'Invalid email format', 'details': str(e)}), 400

    if 'name' in data:
        update_data['name'] = data['name']
    if 'address' in data:
        update_data['address'] = data['address']
    if 'description' in data:
        update_data['description'] = data['description']
    
    if image_file:
        try:
            
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            update_data['image'] = image_data
        except Exception as e:
            return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500
    
    try:
        result = db['organizations'].update_one({'_id': ObjectId(org_id)}, {'$set': update_data})

        if result.modified_count == 0:
            return jsonify({'message': 'No changes made'}), 200

        return jsonify({'message': 'Organization profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@organizations.route('/delete_account', methods=['DELETE'])
@jwt_required()
def delete_org_account():
    org_id = get_jwt_identity()
    db = current_app.db
    result = db['organizations'].delete_one({'_id': ObjectId(org_id)})

    if result.deleted_count == 0:
        return jsonify({'error': 'Organization not found'}), 404

    return jsonify({'message': 'Organization account deleted successfully'}), 200

@organizations.route('/get_my_events', methods=['GET'])
@jwt_required()
def get_org_events():
    db = current_app.db
    org_id = get_jwt_identity()

    organization = db['organizations'].find_one({"_id": ObjectId(org_id)})

    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    current_date = datetime.now().strftime('%Y-%m-%d')
    past_events = [event for event in organization.get('created_events', []) if event['date'] < current_date]
    upcoming_events = [event for event in organization.get('created_events', []) if event['date'] >= current_date]

    return jsonify({"past_events": past_events, "upcoming_events": upcoming_events}), 200

@organizations.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    db = current_app.db

    reset_token = data.get('reset_token')
    new_password = data.get('new_password')

    try:
        decoded_token = decode_token(reset_token)
        org_id = decoded_token['sub']
    except Exception as e:
        return jsonify({'error': 'Invalid or expired token', 'details': str(e)}), 400

    if not is_valid_password(new_password):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db['organizations'].update_one({'_id': ObjectId(org_id)}, {'$set': {'password': hashed_password}})

    return jsonify({'message': 'Password updated successfully'}), 200