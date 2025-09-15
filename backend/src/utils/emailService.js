const nodemailer = require('nodemailer');

/**
 * Email service supporting multiple providers
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.provider = process.env.EMAIL_PROVIDER || 'gmail';
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on provider
   */
  initializeTransporter() {
    try {
      switch (this.provider) {
        case 'resend':
          this.transporter = this.createResendTransporter();
          break;
        case 'sendgrid':
          this.transporter = this.createSendGridTransporter();
          break;
        case 'gmail':
          this.transporter = this.createGmailTransporter();
          break;
        default:
          console.warn(`Unknown email provider: ${this.provider}. Falling back to Gmail.`);
          this.transporter = this.createGmailTransporter();
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error.message);
    }
  }

  /**
   * Create Resend transporter
   */
  createResendTransporter() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for Resend provider');
    }

    return nodemailer.createTransporter({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
      }
    });
  }

  /**
   * Create SendGrid transporter
   */
  createSendGridTransporter() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
    }

    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  /**
   * Create Gmail transporter (for testing/development)
   */
  createGmailTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn('Gmail credentials not provided. Email functionality will be limited.');
      return null;
    }

    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email, otp, name = null) {
    if (!this.transporter) {
      console.log('📧 Email transporter not configured. OTP would be sent to:', email, 'OTP:', otp);
      return { success: true, messageId: 'test-' + Date.now() };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Marketing Hub'}" <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
      to: email,
      subject: 'Your Marketing Hub Login Code',
      html: this.generateOTPEmailTemplate(otp, name),
      text: `Your Marketing Hub login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('📧 Failed to send OTP email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML template for OTP email
   */
  generateOTPEmailTemplate(otp, name = null) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Login Code - Marketing Hub</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 20px; }
          .otp-box { background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Marketing Hub</h1>
          </div>
          
          <div class="content">
            <h2>Welcome ${name ? name : 'back'}!</h2>
            
            <p>You requested to sign in to your Marketing Hub account. Use the verification code below to complete your login:</p>
            
            <div class="otp-box">
              <div style="font-size: 16px; color: #64748b; margin-bottom: 10px;">Your verification code is:</div>
              <div class="otp-code">${otp}</div>
              <div style="font-size: 14px; color: #64748b; margin-top: 10px;">This code expires in 10 minutes</div>
            </div>
            
            <div class="warning">
              <strong>Security Note:</strong> Never share this code with anyone. Marketing Hub will never ask for your verification code via phone or email.
            </div>
            
            <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
            
            <p style="margin-top: 40px;">
              Best regards,<br>
              <strong>The Marketing Hub Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${email || 'your email'}. If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Marketing Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection() {
    if (!this.transporter) {
      return { success: false, error: 'No transporter configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();