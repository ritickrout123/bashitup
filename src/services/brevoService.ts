
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

export class BrevoService {
    private apiInstance: SibApiV3Sdk.EmailCampaignsApi;
    private transactionalApiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor() {
        this.apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
        this.transactionalApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async createCampaign(
        name: string,
        subject: string,
        sender: { name: string; email: string },
        htmlContent: string,
        listIds: number[],
        scheduledAt?: string
    ) {
        const emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();

        emailCampaigns.name = name;
        emailCampaigns.subject = subject;
        emailCampaigns.sender = sender;
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
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

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
