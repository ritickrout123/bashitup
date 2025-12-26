import { NextResponse } from 'next/server';

export async function GET() {
  // Only enable in development or with a debug flag
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_ENV) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  });
}