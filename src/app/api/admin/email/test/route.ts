
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { EmailAutomationService } from '@/services/emailAutomationService';
import { BrevoService } from '@/services/brevoService';

const brevoService = new BrevoService();

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const token = req.cookies.get('accessToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await AuthService.verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { email, subject, htmlContent, data } = body;

        if (!email || !subject || !htmlContent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`Sending test email to ${email}`);

        // 3. Replace Variables (using the existing service logic, but exposed via a helper or duplicated)
        // We can use the private helper if we make it public, or just copy the logic. 
        // Since it's private in EmailAutomationService, let's use a quick local replacement for now 
        // OR -- better -- add a public helper to EmailAutomationService. To avoid modifying that file right now, 
        // I will implement the replacement logic here to ensure isolation.

        const replaceVariables = (text: string, data: Record<string, any>): string => {
            return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                const keys = path.trim().split('.');
                let value = data;

                for (const key of keys) {
                    if (value && typeof value === 'object' && key in value) {
                        value = value[key];
                    } else {
                        return match;
                    }
                }
                return String(value);
            });
        };

        const finalSubject = replaceVariables(subject, data || {});
        const finalBody = replaceVariables(htmlContent, data || {});

        // 4. Send via Brevo
        await brevoService.sendTransactionalEmail(
            [{ email }],
            `[TEST] ${finalSubject}`,
            finalBody
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
    }
}
