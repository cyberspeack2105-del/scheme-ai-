import { NextResponse } from 'next/server';
import dbConnect from '../../../../utils/mongodb';
import Review from '../../../../models/Review';
import ActivityLog from '../../../../models/ActivityLog';

export async function POST(request) {
  try {
    await dbConnect();
    const { user_name, user_email, user_image, role, rating, comment } = await request.json();
    
    const review = new Review({
      user_name,
      user_email,
      user_image,
      role,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });
    
    await review.save();

    // Log this activity silently
    try {
      const log = new ActivityLog({
        user_email: "system",
        action: "POSTED_REVIEW",
        target: `Rated ${rating} stars`,
        timestamp: new Date().toISOString()
      });
      await log.save();
    } catch (e) {
      // Ignore background log errors
    }

    return NextResponse.json({ message: "Review submitted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ timestamp: -1 }).limit(50);
    const formatted = reviews.map(r => {
      const obj = r.toObject();
      obj._id = obj._id.toString();
      return obj;
    });
    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
