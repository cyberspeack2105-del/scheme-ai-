import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../utils/mongodb';
import User from '../../../models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Parse form-data
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const imageFile = formData.get('image'); // File object
    
    if (!name || !email || !password) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }
    
    // Process image file to base64
    let imageUrl = '/uploads/default.png';
    if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      image_url: imageUrl,
      role: 'user'
    });
    
    await newUser.save();
    console.log(`[Next.js API] Successfully registered user: ${normalizedEmail}`);
    
    return NextResponse.json({
      message: "User registered successfully",
      user: { name, email: normalizedEmail }
    }, { status: 200 });
  } catch (error) {
    console.error("[Next.js API] Registration error:", error);
    return NextResponse.json({ detail: `Database error: ${error.message}` }, { status: 500 });
  }
}
