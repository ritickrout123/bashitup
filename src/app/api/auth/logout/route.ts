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
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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