import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { credential } = body;

        if (!credential) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Credential is required' } },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.warn('GOOGLE_CLIENT_ID is not set. Using a fallback for testing (NOT SECURE FOR PRODUCTION unless using correct client id from frontend)');
            // In dev without ENV, we might not be able to verify signature correctly if we don't know the audience.
            // However, verifyIdToken requires an ID.
        }

        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (error) {
            console.error('Google token verification failed:', error);
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid Google token' } },
                { status: 401 }
            );
        }

        if (!payload || !payload.email) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_TOKEN', message: 'Token payload missing email' } },
                { status: 400 }
            );
        }

        const { email, sub: googleId, name, picture } = payload;

        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { googleId }
                ]
            }
        });

        if (!user) {
            // Create new user (Sign Up)
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    googleId,
                    role: 'CUSTOMER', // Default role
                    isActive: true
                }
            });
        } else {
            // If user exists but doesn't have googleId linked, link it
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId }
                });
            }
        }

        // Generate App Token using same logic as standard login
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        // Create response
        const response = NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token
            }
        });

        // Set HTTP-only cookie
        response.cookies.set('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Google authentication failed' } },
            { status: 500 }
        );
    }
}
