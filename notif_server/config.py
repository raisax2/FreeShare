import os

class Config:
    MONGO_URI = os.getenv("MICROSERVICE_MONGO_URI")