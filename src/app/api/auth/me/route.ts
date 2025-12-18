import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { APIResponse, User } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
        timestamp: new Date(),
      }, { status: 401 });
    }
    
    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: new Date(),
      }, { status: 404 });
    }
    
    return NextResponse.json<APIResponse<Omit<User, 'password'>>>({
      success: true,
      data: user,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get user API error:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user information',
      },
      timestamp: new Date(),
    }, { status: 500 });
  }
}