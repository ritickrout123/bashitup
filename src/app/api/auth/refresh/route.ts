import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { APIResponse, AuthResponse } from '@/types';
import { AuthenticationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token not found',
        },
        timestamp: new Date(),
      }, { status: 401 });
    }
    
    const authResponse = await AuthService.refreshToken(refreshToken);
    
    // Set new HTTP-only cookies for tokens
    const response = NextResponse.json<APIResponse<AuthResponse>>({
      success: true,
      data: authResponse,
      timestamp: new Date(),
    });

    // Set secure cookies
    response.cookies.set('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh API error:', error);
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message,
        },
        timestamp: new Date(),
      }, { status: 401 });
    }
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token refresh failed',
      },
      timestamp: new Date(),
    }, { status: 500 });
  }
}