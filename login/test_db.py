from pymongo import MongoClient

MONGO_URL = "mongodb+srv://raju:m8RCWcDxj4AfAm77@cluster0.dsttruk.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URL)

db = client["auth_db"]
users = db["users"]

print("✅ MongoDB Atlas Connected Successfully!")
