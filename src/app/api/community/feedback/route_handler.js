import { NextResponse } from 'next/server';
import dbConnect from '../../../../utils/mongodb';
import Feedback from '../../../../models/Feedback';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, message } = await request.json();
    
    const fb = new Feedback({
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    });
    
    await fb.save();
    return NextResponse.json({ message: "Feedback submitted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const fbs = await Feedback.find().sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(fbs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
