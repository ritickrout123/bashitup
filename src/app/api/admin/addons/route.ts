
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const userRole = request.headers.get('x-user-role');
        if (userRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            );
        }

        const addons = await prisma.addon.findMany({
            where: {
                isActive: true, // Only fetch active addons for selection
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            data: addons,
        });
    } catch (error) {
        console.error('Error fetching addons:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch addons' } },
            { status: 500 }
        );
    }
}
