import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../utils/mongodb';

export async function GET() {
  let status = "Connected";
  try {
    await dbConnect();
    if (mongoose.connection.readyState !== 1) {
      status = "Connecting/Disconnected";
    }
  } catch (err) {
    status = `Failed: ${err.message}`;
  }
  
  return NextResponse.json({
    status: status,
    database_host: process.env.MONGO_URL ? "Atlas Connected" : "Local/Other",
    collection: "users"
  });
}
