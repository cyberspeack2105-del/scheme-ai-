import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../utils/auth';
import dbConnect from '../../../../../utils/mongodb';
import Review from '../../../../../models/Review';

export async function DELETE(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ detail: "Missing review ID" }, { status: 400 });
    }

    await dbConnect();
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    }

    // Check ownership or admin role
    if (review.user_email !== user.email && user.role !== 'admin') {
      return NextResponse.json({ detail: "Not authorized to delete this review" }, { status: 403 });
    }

    await Review.deleteOne({ _id: id });
    return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: "Invalid review ID" }, { status: 400 });
  }
}
