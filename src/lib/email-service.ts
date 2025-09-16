import ApiClient from "./api-client";

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface BulkEmailRequest {
  recipients: string[];
  subject: string;
  body: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private EMAIL_ENDPOINT = "/email";

  async sendEmail(payload: SendEmailRequest): Promise<EmailResponse> {
    const response = await ApiClient.post<EmailResponse>(
      `${this.EMAIL_ENDPOINT}/send`,
      payload
    );
    return response.data;
  }

  async sendBulkEmail(payload: BulkEmailRequest): Promise<EmailResponse> {
    const response = await ApiClient.post<EmailResponse>(
      `${this.EMAIL_ENDPOINT}/bulk`,
      payload
    );
    return response.data;
  }

  async getAnalytics(params?: Record<string, any>): Promise<any> {
    const response = await ApiClient.get(`${this.EMAIL_ENDPOINT}/analytics`, { params });
    return response.data;
  }
}

export const EmailServiceInstance = new EmailService();
export { EmailService };
export default EmailServiceInstance;
