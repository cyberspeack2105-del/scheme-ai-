from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from passlib.context import CryptContext
import os

# -----------------------------
# App Init
# -----------------------------
app = FastAPI(title="Login & Register API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # frontend access
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# MongoDB Connection
# -----------------------------
# Change this if your MongoDB URI is different
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["auth_db"]
users = db["users"]

# -----------------------------
# Password Hashing
# -----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# -----------------------------
# API Routes
# -----------------------------

@app.get("/")
def read_root():
    return FileResponse(os.path.join(os.path.dirname(__file__), "index.html"))

@app.post("/register")
def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...)
):
    # Check password match
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check existing email
    if users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    # Insert user
    users.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password)
    })

    return {"message": "Registration successful"}

@app.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...)
):
    user = users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }
