from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from database import users_collection
from models import Token, UserResponse
from datetime import timedelta
from typing import Annotated
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register")
async def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    image: UploadFile = File(...)
):
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Save Image
    image_path = f"{UPLOAD_DIR}/{image.filename}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    hashed_password = get_password_hash(password)
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "image_url": f"/uploads/{image.filename}"
    }
    users_collection.insert_one(new_user)
    
    # Return user info without password
    return {
        "name": new_user["name"],
        "email": new_user["email"],
        "image_url": new_user["image_url"]
    }

@router.post("/login")
async def login(
    username: str = Form(...), # Frontend might send 'username' key for email
    password: str = Form(...)
):
    user = users_collection.find_one({"email": username}) # We treat username as email
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "image_url": user.get("image_url", "")
        }
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    # Map _id to string if needed, or just return dict
    return {
        "name": current_user["name"],
        "email": current_user["email"]
    }
