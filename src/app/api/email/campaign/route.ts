import { NextRequest, NextResponse } from 'next/server';
import { BrevoService } from '@/services/brevoService';
import { APIResponse } from '@/types';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

const brevoService = new BrevoService();

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Admin Auth
        // Use cookies as per registration flow
        const token = request.cookies.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // Verify token (assuming verifyToken can take string)
        // If verifyToken expects specific format or errors, wrap in try/catch or handle null
        const user = await AuthService.verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 });
        }
        const body = await request.json();
        const { subject, content, targetRole } = body; // targetRole: 'ALL', 'CUSTOMER', 'DECORATOR'

        if (!subject || !content) {
            return NextResponse.json({ success: false, error: { message: 'Missing subject or content' } }, { status: 400 });
        }

        // 2. Fetch Users based on role
        let users;
        if (targetRole && targetRole !== 'ALL') {
            users = await prisma.user.findMany({
                where: { role: targetRole, isActive: true },
                select: { email: true, name: true }
            });
        } else {
            users = await prisma.user.findMany({
                where: { isActive: true },
                select: { email: true, name: true }
            });
        }

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: { message: 'No users found for this role' } }, { status: 404 });
        }

        // 3. Send Emails via Brevo Transactional API (Batching or Individual)
        // Note: Brevo Campaigns API is better for bulk, but requires List IDs. 
        // Here we are doing a "broadcast" using transactional API for simplicity as per requirements (MVP).
        // For a real production app with thousands of users, we would sync contacts to Brevo Lists and use createCampaign.
        // However, the `BrevoService.createCampaign` method takes `listIds`. 
        // Since we don't have user lists synced to Brevo, we will use `sendTransactionalEmail` in a loop/batch 
        // OR just use it for a few test users.

        // STARTUP APPROACH: using sendTransactionalEmail with multiple TO recipients (Brevo supports array of recipients for transactional)
        // Limit: Brevo Transactional per call has limits.
        // For this implementation, let's assume valid low volume.

        const recipients = users.map(u => ({ email: u.email, name: u.name }));

        // Batching logic if needed (e.g. 50 at a time)
        const BATCH_SIZE = 50;
        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);
            await brevoService.sendTransactionalEmail(
                batch,
                subject,
                content,
                { email: 'newsletter@bashitnow.com', name: 'BashItNow Updates' }
            );
        }

        return NextResponse.json({
            success: true,
            data: { count: users.length, message: 'Campaign sent successfully' }
        });

    } catch (error) {
        console.error('Campaign API Error:', error);
        return NextResponse.json({ success: false, error: { message: 'Failed to send campaign' } }, { status: 500 });
    }
}
