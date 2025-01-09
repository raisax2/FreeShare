from flask import Flask, request, jsonify
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from config import Config
from dotenv import load_dotenv
from bson import ObjectId
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

mongo_client = MongoClient(app.config["MONGO_URI"])
notification_db = mongo_client.get_database("microserviceDB")

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1), retry=retry_if_exception_type(PyMongoError))
def insert_notification(notification):
    return notification_db.notifications.insert_one(notification)

@app.route('/notifications', methods=['POST'])
def send_notification():
    data = request.get_json()
    org_id = data.get('org_id')
    message = data.get('message')

    if not org_id or not message:
        return jsonify({"error": "Organization ID and message are required"}), 400

    notification = {
        "organization_id": org_id,
        "message": message,
        "status": "unread"
    }

    try:
        result = insert_notification(notification)
        if result.inserted_id:
            return jsonify({"message": "Notification sent successfully", "id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "Failed to insert notification"}), 500
    except PyMongoError:
        return jsonify({"error": "Failed to send notification after retries"}), 500

@app.route('/notifications/<string:org_id>', methods=['GET'])
def get_notifications_by_org(org_id):
    try:
        print(f"Fetching notifications for organization_id: {org_id}")  # Log the org_id
        notifications = notification_db.notifications.find({"organization_id": org_id})

        result = [
            {
                "id": str(notification["_id"]),
                "organization_id": notification.get("organization_id"),
                "message": notification["message"],
                "status": notification["status"]
            }
            for notification in notifications
        ]

        print(f"Query result: {result}")  # Log the query results

        if not result:
            return jsonify({"message": "No notifications found for the organization"}), 200

        return jsonify(result), 200

    except PyMongoError:
        return jsonify({"error": "Failed to retrieve notifications"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
