
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

// GET /api/admin/email-templates/[id] - Get template details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const template = await prisma.emailTemplate.findUnique({
            where: { id: params.id },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/email-templates/[id] - Update template
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, subject, htmlContent, type, variables, isActive } = body;

        const template = await prisma.emailTemplate.update({
            where: { id: params.id },
            data: {
                name,
                subject,
                body: htmlContent,
                type,
                variables,
                isActive,
            },
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/admin/email-templates/[id] - Delete template
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.emailTemplate.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
