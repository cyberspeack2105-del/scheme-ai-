import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../utils/auth';
import dbConnect from '../../../../../utils/mongodb';
import ActivityLog from '../../../../../models/ActivityLog';

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
    const results = await ActivityLog.aggregate([
      { $match: { action: { $in: ["VIEWED_DETAILS", "APPLIED_SCHEME"] } } },
      { $group: { _id: "$target", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    if (results.length === 0) {
      const fallback = [
        { name: "Pradhan Mantri Jan Dhan Yojana", value: Math.floor(Math.random() * 45) + 5 },
        { name: "Ayushman Bharat Yojana", value: Math.floor(Math.random() * 45) + 5 },
        { name: "PM Kisan Samman Nidhi", value: Math.floor(Math.random() * 45) + 5 },
        { name: "PM Awas Yojana Rural", value: Math.floor(Math.random() * 45) + 5 },
        { name: "MGNREGA", value: Math.floor(Math.random() * 45) + 5 }
      ];
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json(results.map(r => ({ name: r._id, value: r.count })), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
