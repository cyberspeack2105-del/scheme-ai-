import { NextResponse } from 'next/server';
import dbConnect from '../../../../utils/mongodb';
import ChatMessage from '../../../../models/ChatMessage';

export async function POST(request) {
  try {
    await dbConnect();
    const { user_name, user_image, message, role } = await request.json();
    
    const msg = new ChatMessage({
      user_name,
      user_image,
      message,
      role,
      timestamp: new Date().toISOString()
    });
    
    await msg.save();
    return NextResponse.json({ status: "sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const msgs = await ChatMessage.find().sort({ timestamp: 1 }).limit(50);
    return NextResponse.json(msgs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
