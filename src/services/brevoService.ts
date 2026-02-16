
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
const emailCampaignsApiInstance = new brevo.EmailCampaignsApi();

// Configure API key authorization
// @ts-ignore - The new Brevo SDK has 'authentications' as protected, but the docs say to access it this way (or cast to any)
const apiKey = (apiInstance as any).authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

const emailCampaignsApiKey = (emailCampaignsApiInstance as any).authentications['apiKey'];
emailCampaignsApiKey.apiKey = process.env.BREVO_API_KEY || '';

export class BrevoService {
    private apiInstance: brevo.EmailCampaignsApi;
    private transactionalApiInstance: brevo.TransactionalEmailsApi;

    constructor() {
        this.apiInstance = emailCampaignsApiInstance;
        this.transactionalApiInstance = apiInstance;
    }

    async createCampaign(
        name: string,
        subject: string,
        sender: { name: string; email: string },
        htmlContent: string,
        listIds: number[],
        scheduledAt?: string
    ) {
        const emailCampaigns = new brevo.CreateEmailCampaign();

        emailCampaigns.name = name;
        emailCampaigns.subject = subject;
        emailCampaigns.sender = sender;
        // @ts-ignore - The type definition in the SDK might be strict about this string, but 'classic' is correct for standard campaigns
        emailCampaigns.type = 'classic';
        emailCampaigns.htmlContent = htmlContent;
        emailCampaigns.recipients = { listIds };

        if (scheduledAt) {
            emailCampaigns.scheduledAt = scheduledAt;
        }

        try {
            const data = await this.apiInstance.createEmailCampaign(emailCampaigns);
            console.log('API called successfully. Returned data: ' + JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    }

    async sendTransactionalEmail(
        to: { email: string; name?: string }[],
        subject: string,
        htmlContent: string,
        sender: { email: string; name: string } = { email: 'noreply@bashitnow.com', name: 'BashItNow' }
    ) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.to = to;

        try {
            const data = await this.transactionalApiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Transactional email sent successfully. Returned data: ' + JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error sending transactional email:', error);
            // Don't throw here to avoid failing the entire registration if email fails
            return null;
        }
    }
}
