import { NextResponse } from 'next/server';
import dbConnect from '../../../../utils/mongodb';
import ActivityLog from '../../../../models/ActivityLog';

export async function POST(request) {
  try {
    await dbConnect();
    const { user_email, action, target } = await request.json();
    
    const log = new ActivityLog({
      user_email,
      action,
      target,
      timestamp: new Date().toISOString()
    });
    
    await log.save();
    return NextResponse.json({ status: "logged" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
