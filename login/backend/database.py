from pymongo import MongoClient
import os

# Use local MongoDB - change to Atlas URL if needed
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)

db = client["auth_db"]
users_collection = db["users"]
