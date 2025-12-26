import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { LoginCredentials, APIResponse, AuthResponse } from '@/types';
import { ValidationError, AuthenticationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    
    const authResponse = await AuthService.login(body);
    
    // Set HTTP-only cookies for tokens
    const response = NextResponse.json<APIResponse<AuthResponse>>({
      success: true,
      data: authResponse,
      timestamp: new Date(),
    });

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';
    
    response.cookies.set('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
        timestamp: new Date(),
      }, { status: 400 });
    }
    
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
        message: 'Login failed',
      },
      timestamp: new Date(),
    }, { status: 500 });
  }
}