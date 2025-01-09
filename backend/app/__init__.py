from flask import Flask
from pymongo import MongoClient
from app.config import Config
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

client = None
db = None

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
    app.config.from_object(Config)

    global client, db
    client = MongoClient(app.config['MONGO_URI'])
    db = client.get_database()

    app.db = db
    db.users.create_index([("email", 1)], unique=True)
    db.organizations.create_index([("email", 1)], unique=True)

    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY')
    app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    jwt = JWTManager(app)

    from .routes.user_routes import users as users_blueprint
    from .routes.volunteering_routes import volunteering as volunteering_blueprint
    from .routes.organization_routes import organizations as organizations_blueprint
    
    app.register_blueprint(users_blueprint, url_prefix='/users')
    app.register_blueprint(volunteering_blueprint, url_prefix='/volunteering')
    app.register_blueprint(organizations_blueprint, url_prefix='/organizations')

    return app