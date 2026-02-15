
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

// 1. GET /api/admin/email-templates - List all templates
export async function GET(req: NextRequest) {
    try {
        // Check admin auth
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// 2. POST /api/admin/email-templates - Create new template
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, subject, htmlContent, type, variables } = body;

        if (!name || !subject || !htmlContent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const template = await prisma.emailTemplate.create({
            data: {
                name,
                subject,
                body: htmlContent,
                type: type || 'TRANSACTIONAL',
                variables: variables || [],
            },
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Error creating email template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
