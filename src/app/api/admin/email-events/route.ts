
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

// GET /api/admin/email-events - List all events
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const events = await prisma.emailEvent.findMany({
            include: {
                template: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { eventKey: 'asc' },
        });

        return NextResponse.json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching email events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
