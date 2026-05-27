import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../utils/mongodb';
import User from '../../../models/User';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(request) {
  try {
    await dbConnect();
    
    let username = '';
    let password = '';
    
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username;
      password = body.password;
    } else {
      // Handles multipart/form-data or application/x-www-form-urlencoded
      const formData = await request.formData();
      username = formData.get('username');
      password = formData.get('password');
    }
    
    if (!username || !password) {
      return NextResponse.json({ detail: "Missing username or password" }, { status: 400 });
    }
    
    const normalizedEmail = username.toLowerCase().trim();
    
    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ detail: "Incorrect email or password" }, { status: 401 });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ detail: "Incorrect email or password" }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { sub: user.email },
      SECRET_KEY,
      { expiresIn: '30m' }
    );
    
    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      role: user.role || "user",
      user: {
        name: user.name,
        email: user.email,
        image_url: user.image_url || "",
        role: user.role || "user"
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] Login error:", error);
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}
