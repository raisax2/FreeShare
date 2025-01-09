import requests
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from geopy.distance import geodesic
from math import radians, sin, cos, sqrt, atan2

volunteering = Blueprint('volunteering', __name__)

@volunteering.route('/events', methods=['GET'])
@jwt_required()
def list_events():
    db = current_app.db
    events = db['events'].find()
    events_list = []

    for event in events:
        events_list.append({
            "id": str(event["_id"]),
            "name": event["name"],
            "description": event["description"],
            "date": event["date"],
            "organization_id": str(event["organization_id"])
        })

    return jsonify(events_list), 200

@volunteering.route('/events/<string:event_id>', methods=['GET'])
@jwt_required()
def view_event(event_id):
    db = current_app.db
    event = db['events'].find_one({"_id": ObjectId(event_id)})

    if not event:
        return jsonify({"error": "Event not found"}), 404

    return jsonify({
        "id": str(event["_id"]),
        "name": event["name"],
        "description": event["description"],
        "date": event["date"],
        "organization_id": str(event["organization_id"])
    }), 200

@volunteering.route('/create-event', methods=['POST'])
@jwt_required()
def add_event():
    data = request.get_json()
    db = current_app.db
    org_id = get_jwt_identity()

    
    if not data.get("name") or not data.get("description") or not data.get("date") or not data.get("address"):
        return jsonify({"error": "Event name, description, date, and address are required"}), 400

    lat = data.get("lat")
    lng = data.get("lng")
    if (lat and not isinstance(lat, (float, int))) or (lng and not isinstance(lng, (float, int))):
        return jsonify({"error": "Invalid latitude or longitude values"}), 400
    
    event = {
        "name": data["name"],
        "description": data["description"],
        "date": data["date"],
        "address": data["address"],
        "lat": lat,
        "lng": lng,
        "org_id": ObjectId(org_id)
    }

    result = db['events'].insert_one(event)

    if not result.inserted_id:
        return jsonify({"error": "Failed to create event"}), 500
    
    update_result = db['organizations'].update_one(
        {"_id": ObjectId(org_id)},
        {"$addToSet": {"created_events": {"id": str(result.inserted_id), "name": event["name"], "date": event["date"]}}}
    )

    if not update_result.matched_count:
        db['events'].delete_one({"_id": result.inserted_id})  
        return jsonify({"error": "Failed to update organization events"}), 500

    return jsonify({
        "message": "Event created successfully",
        "event_id": str(result.inserted_id),
        "org_id": org_id
    }), 201

@volunteering.route('/register-for-event/<string:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    db = current_app.db
    user_id = get_jwt_identity()

    
    event = db['events'].find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    if db['registrations'].find_one({"user_id": ObjectId(user_id), "event_id": ObjectId(event_id)}):
        return jsonify({"error": "User already registered for this event"}), 400
    
    registration = {
        "user_id": ObjectId(user_id),
        "event_id": ObjectId(event_id),
        "status": "registered"
    }
    registration_id = db['registrations'].insert_one(registration).inserted_id

    update_result = db['users'].update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"events": {"id": str(event["_id"]), "name": event["name"], "date": event["date"]}}}
    )

    if not update_result.matched_count:
        db['registrations'].delete_one({"_id": registration_id})  
        return jsonify({"error": "Failed to update user events"}), 500
    
    org_id = str(event["org_id"])
    user = db['users'].find_one({"_id": ObjectId(user_id)})
    user_name = user.get("fullName", "A volunteer")  
    event_name = event.get("name", "an event")
    message = f"{user_name} registered for your {event_name} volunteering event."

    try:
        notification_service_url = current_app.config["NOTIFICATION_SERVICE_URL"]
        notification_data = {
            "org_id": org_id,
            "message": message
        }
        response = requests.post(notification_service_url, json=notification_data)

        if response.status_code != 201:
            db['registrations'].delete_one({"_id": registration_id})
            return jsonify({
                "error": "Registration failed due to notification service error",
                "details": response.json()
            }), 500
    except requests.exceptions.RequestException as e:
        db['registrations'].delete_one({"_id": registration_id})
        return jsonify({"error": "Registration failed due to notification service error", "details": str(e)}), 500

    return jsonify({"message": "Successfully registered for the event"}), 201

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371  
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

@volunteering.route('/nearest-events', methods=['GET'])
@jwt_required()
def nearest_events():
    db = current_app.db
    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))

    events = db['events'].find()
    events_with_distance = []

    for event in events:
        event_lat = event.get('lat')
        event_lng = event.get('lng')
        if event_lat and event_lng:
            distance = geodesic((lat, lng), (event_lat, event_lng)).miles
            events_with_distance.append({
                "id": str(event["_id"]),
                "name": event["name"],
                "description": event["description"],
                "date": event["date"],
                "lat": event_lat,
                "lng": event_lng,
                "distance": distance
            })

    events_with_distance.sort(key=lambda x: x["distance"])

    return jsonify(events_with_distance), 200