import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../utils/auth';
import User from '../../../../models/User';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    const users = await User.find({}, { password: 0 });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}
