import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../utils/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role || "user",
    image_url: user.image_url || ""
  }, { status: 200 });
}
