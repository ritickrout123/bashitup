import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, hasRole } from '@/lib/auth-edge';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['ADMIN'],
  '/dashboard': ['CUSTOMER', 'ADMIN', 'DECORATOR'],
  '/decorator': ['DECORATOR', 'ADMIN'],
  '/api/admin': ['ADMIN'],
  '/api/decorator': ['DECORATOR', 'ADMIN'],
  '/api/bookings': ['CUSTOMER', 'ADMIN', 'DECORATOR'],
  '/api/auth/me': ['CUSTOMER', 'ADMIN', 'DECORATOR'],
  '/api/auth/logout': ['CUSTOMER', 'ADMIN', 'DECORATOR'],
} as const;

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/themes',
  '/portfolio',
  '/about',
  '/contact',
  '/booking',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/themes',
  '/api/portfolio',
  '/api/bookings/availability',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow guest bookings (POST /api/bookings)
  if (pathname === '/api/bookings' && request.method === 'POST') {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  const protectedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token found:', !!token);
  console.log('Middleware - Cookies:', request.cookies.getAll().map(c => c.name));

  if (!token) {
    console.log('Middleware - No token found, redirecting to login');
    // Redirect to login for browser requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      },
      { status: 401 }
    );
  }

  try {
    // Verify token
    const payload = await verifyAccessToken(token);
    const requiredRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];

    // Check if user has required role
    if (!hasRole(payload.role, [...requiredRoles])) {
      // Redirect to unauthorized page for browser requests
      if (request.headers.get('accept')?.includes('text/html')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Return 403 for API requests
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        },
        { status: 403 }
      );
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.role);

    return response;
  } catch (error) {
    console.error('Middleware auth error:', error);

    // Redirect to login for browser requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        }
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.png|public|sw.js|manifest.json).*)',
  ],
};