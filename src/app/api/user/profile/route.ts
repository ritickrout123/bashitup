import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth-edge';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
    try {
        // Authenticate user
        const token = request.cookies.get('accessToken')?.value ||
            request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        let payload;
        try {
            payload = await verifyAccessToken(token);
        } catch (error) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
                { status: 401 }
            );
        }

        const { userId } = payload;
        const body = await request.json();
        const { name, phone } = body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid name is required' } },
                { status: 400 }
            );
        }

        if (phone && (typeof phone !== 'string' || !/^(\+91|91)?[6-9]\d{9}$/.test(phone.replace(/\s+/g, '')))) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid phone number format' } },
                { status: 400 }
            );
        }

        // Check if phone is already taken by another user
        if (phone) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone: phone.replace(/\s+/g, ''),
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone number already in use' } },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                phone: phone ? phone.replace(/\s+/g, '') : null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
            { status: 500 }
        );
    }
}
