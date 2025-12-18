// Edge Runtime compatible auth utilities
import { jwtVerify } from 'jose';
import { JWTPayload, UserRole } from '@/types';

/**
 * Verify JWT access token (Edge Runtime compatible)
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}