import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../utils/auth';
import User from '../../../../../models/User';

export async function DELETE(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    const { email } = params;
    if (!email) {
      return NextResponse.json({ detail: "Missing user email parameter" }, { status: 400 });
    }
    
    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();
    const result = await User.deleteOne({ email: normalizedEmail });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: `User ${normalizedEmail} deleted successfully` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}
