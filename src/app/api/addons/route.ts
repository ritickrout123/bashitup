import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const addons = await prisma.addon.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                category: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            data: addons,
        });
    } catch (error) {
        console.error('Failed to fetch addons:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: 'Failed to fetch addons',
                },
            },
            { status: 500 }
        );
    }
}
