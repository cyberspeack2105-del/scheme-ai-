import jwt from 'jsonwebtoken';
import dbConnect from './mongodb';
import User from '../models/User';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function verifyAuth(request) {
  await dbConnect();
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const email = payload.sub;
    if (!email) return null;

    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}
