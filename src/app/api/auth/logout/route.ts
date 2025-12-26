import { NextResponse } from 'next/server';
import { APIResponse } from '@/types';

export async function POST() {
  try {
    // Clear authentication cookies
    const response = NextResponse.json<APIResponse<{ message: string }>>({
      success: true,
      data: { message: 'Logged out successfully' },
      timestamp: new Date(),
    });

    // Clear cookies by setting them to expire immediately
    const isProduction = process.env.NODE_ENV === 'production' || 
                         process.env.NETLIFY === 'true' || 
                         process.env.VERCEL === '1';
    
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed',
      },
      timestamp: new Date(),
    }, { status: 500 });
  }
}