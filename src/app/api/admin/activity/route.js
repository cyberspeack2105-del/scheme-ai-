import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../utils/auth';
import dbConnect from '../../../../utils/mongodb';
import ActivityLog from '../../../../models/ActivityLog';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    await dbConnect();
    const logs = await ActivityLog.find().sort({ _id: -1 }).limit(20);
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
