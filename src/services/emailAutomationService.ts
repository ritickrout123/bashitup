
import { prisma } from '@/lib/prisma';
import { BrevoService } from './brevoService';

const brevoService = new BrevoService();

export class EmailAutomationService {
    /**
     * Trigger an email event
     * @param eventKey The unique key of the event (e.g. 'USER_SIGNUP')
     * @param recipientEmail The email address of the recipient
     * @param data Object containing data to replace variables (e.g. { user: { name: 'John' } })
     */
    static async triggerEvent(eventKey: string, recipientEmail: string, data: Record<string, any>) {
        try {
            console.log(`Triggering email event: ${eventKey} for ${recipientEmail}`);

            // 1. Fetch the event and linked template
            const event = await prisma.emailEvent.findUnique({
                where: { eventKey },
                include: { template: true },
            });

            if (!event) {
                console.warn(`Email event '${eventKey}' not found.`);
                return false;
            }

            if (!event.isActive) {
                console.log(`Email event '${eventKey}' is disabled.`);
                return false;
            }

            if (!event.template) {
                console.warn(`No template linked to event '${eventKey}'.`);
                return false;
            }

            const template = event.template;

            // 2. Process the template (replace variables)
            const subject = this.replaceVariables(template.subject, data);
            const body = this.replaceVariables(template.body, data);

            // 3. Send the email
            // Note: BrevoService expects a specific format.
            // We'll use sendTransactionalEmail for now.
            await brevoService.sendTransactionalEmail(
                [{ email: recipientEmail }],
                subject,
                body
            );

            console.log(`Successfully triggered '${eventKey}' email to ${recipientEmail}`);
            return true;

        } catch (error) {
            console.error(`Error triggering email event '${eventKey}':`, error);
            return false;
        }
    }

    /**
     * Replace {{variable.path}} with actual data
     */
    private static replaceVariables(text: string, data: Record<string, any>): string {
        return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const keys = path.trim().split('.');
            let value = data;

            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return match; // Variable not found, leave as is
                }
            }

            return String(value);
        });
    }
}
