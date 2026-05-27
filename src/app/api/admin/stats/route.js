import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../utils/auth';
import User from '../../../../models/User';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    const totalUsers = await User.countDocuments({});
    
    // Simulate active users fluctuation
    const baseActive = Math.floor(totalUsers * 0.6);
    const jitter = Math.floor(totalUsers * 0.05) || 1;
    const randomJitter = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
    const activeNow = Math.max(0, Math.min(totalUsers, baseActive + randomJitter));
    
    const systemLoad = Math.floor(Math.random() * 35) + 10; // 10-45%
    
    return NextResponse.json({
      total_users: totalUsers,
      active_now: activeNow,
      system_load: systemLoad,
      schemes_count: 84,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: `Server error: ${error.message}` }, { status: 500 });
  }
}
