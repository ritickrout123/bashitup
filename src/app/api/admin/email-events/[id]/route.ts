
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

// PUT /api/admin/email-events/[id] - Update event
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { isActive, templateId, delay, recipientType } = body;

        const event = await prisma.emailEvent.update({
            where: { id: params.id },
            data: {
                isActive,
                templateId,
                delay,
                recipientType,
            },
            include: {
                template: true,
            },
        });

        return NextResponse.json({ success: true, data: event });
    } catch (error) {
        console.error('Error updating email event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
