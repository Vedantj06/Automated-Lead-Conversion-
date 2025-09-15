import { ApiClient } from './api-client';

// Email interfaces
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded content
  contentType: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
  variables?: Record<string, string>;
}

export interface SendEmailRequest {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  html?: string;
  text?: string;
  template?: EmailTemplate;
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

export interface BulkEmailRequest {
  emails: SendEmailRequest[];
  batchSize?: number;
  delayBetweenBatches?: number; // in milliseconds
}

export interface BulkEmailResponse {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  results: {
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }[];
}

// Email service class
export class EmailService {
  private static readonly EMAIL_ENDPOINT = import.meta.env.VITE_EMAIL_ENDPOINT || '/email';

  /**
   * Send a single email
   */
  static async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const response = await ApiClient.post<SendEmailResponse>(
        `${this.EMAIL_ENDPOINT}/send`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Send email error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send bulk emails
   */
  static async sendBulkEmails(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    try {
      const response = await ApiClient.post<BulkEmailResponse>(
        `${this.EMAIL_ENDPOINT}/bulk-send`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Send bulk emails error:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: request.emails.length,
        results: request.emails.map(email => ({
          email: email.to[0]?.email || 'unknown',
          success: false,
          error: error.response?.data?.message || 'Failed to send bulk emails',
        })),
      };
    }
  }

  /**
   * Send template-based email
   */
  static async sendTemplateEmail(
    templateId: string, 
    to: EmailRecipient[], 
    variables: Record<string, string>,
    options?: {
      cc?: EmailRecipient[];
      bcc?: EmailRecipient[];
      attachments?: EmailAttachment[];
      tags?: string[];
    }
  ): Promise<SendEmailResponse> {
    try {
      const request = {
        templateId,
        to,
        variables,
        ...options,
      };

      const response = await ApiClient.post<SendEmailResponse>(
        `${this.EMAIL_ENDPOINT}/send-template`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Send template email error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send template email',
      };
    }
  }

  /**
   * Get email delivery status
   */
  static async getEmailStatus(messageId: string): Promise<{
    status: 'delivered' | 'failed' | 'pending' | 'bounced' | 'complained';
    deliveredAt?: string;
    failedAt?: string;
    reason?: string;
  }> {
    try {
      const response = await ApiClient.get<{
        status: 'delivered' | 'failed' | 'pending' | 'bounced' | 'complained';
        deliveredAt?: string;
        failedAt?: string;
        reason?: string;
      }>(`${this.EMAIL_ENDPOINT}/status/${messageId}`);
      return response;
    } catch (error: any) {
      console.error('Get email status error:', error);
      return {
        status: 'failed' as const,
        reason: error.response?.data?.message || 'Failed to get email status',
      };
    }
  }

  /**
   * Get email analytics
   */
  static async getEmailAnalytics(dateRange?: { from: string; to: string }) {
    try {
      const params = dateRange ? `?from=${dateRange.from}&to=${dateRange.to}` : '';
      const response = await ApiClient.get(`${this.EMAIL_ENDPOINT}/analytics${params}`);
      return response;
    } catch (error: any) {
      console.error('Get email analytics error:', error);
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        complained: 0,
        opened: 0,
        clicked: 0,
      };
    }
  }

  /**
   * Validate email addresses
   */
  static async validateEmails(emails: string[]): Promise<{
    valid: string[];
    invalid: string[];
    details: Record<string, { valid: boolean; reason?: string }>;
  }> {
    try {
      const response = await ApiClient.post<{
        valid: string[];
        invalid: string[];
        details: Record<string, { valid: boolean; reason?: string }>;
      }>(`${this.EMAIL_ENDPOINT}/validate`, { emails });
      return response;
    } catch (error: any) {
      console.error('Validate emails error:', error);
      return {
        valid: [],
        invalid: emails,
        details: emails.reduce((acc, email) => ({
          ...acc,
          [email]: { valid: false, reason: 'Validation service unavailable' }
        }), {}),
      };
    }
  }
}

export default EmailService;