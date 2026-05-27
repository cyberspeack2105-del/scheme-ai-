import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../utils/auth';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    const usageData = [];
    const baseUsers = 100;
    
    // Generate 7 days of charts
    for (let i = 7; i > 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      usageData.push({
        name: dateString,
        usage: baseUsers + Math.floor(Math.random() * 180) + 20,
        rating: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) // 4.0 - 5.0 rating
      });
    }
    
    return NextResponse.json(usageData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
