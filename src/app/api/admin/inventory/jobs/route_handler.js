import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../utils/auth';
import jobsData from '../../../../../utils/jobs.json';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ detail: "Not authorized to access this resource" }, { status: 403 });
  }

  try {
    return NextResponse.json(jobsData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: "Failed to load job inventory" }, { status: 500 });
  }
}
