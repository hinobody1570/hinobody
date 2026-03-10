import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private emailSender: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    this.resend = new Resend(apiKey);
    this.emailSender = process.env.VERIFIED_EMAIL_SENDER;
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    mailText: string,
    html?: string,
  ): Promise<any> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.emailSender || 'onboarding@resend.dev',
        to: toEmail,
        subject: subject,
        html: html || mailText,
        text: mailText,
      });

      if (error) {
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }
  }

  async sendVerificationEmail(
    email: string,
    otp: string,
    nickname?: string,
  ): Promise<boolean> {
    const subject = 'Verify Your Email Address';

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Welcome to HiNobody</h2>
          <p>Hello${nickname ? ` ${nickname}` : ''},</p>
          <p>Your verification code is:</p>
          <h1>${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </body>
      </html>
    `;

    const textContent = `Welcome to HiNobody\n\nHello${nickname ? ` ${nickname}` : ''},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;

    return this.sendEmail(email, subject, textContent, htmlContent);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    nickname?: string,
  ): Promise<boolean> {
    const subject = 'Reset Your Password';

    const frontendUrl =
      `${process.env.FRONTEND_URL}` || 'http://localhost:3000';

    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Password Reset</h2>
          <p>Hello${nickname ? ` ${nickname}` : ''},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        </body>
      </html>
    `;

    const textContent = `Password Reset\n\nHello${nickname ? ` ${nickname}` : ''},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.`;

    return this.sendEmail(email, subject, textContent, htmlContent);
  }

  /** Send contact form submission to support (hinobodysupport@gmail.com) */
  async sendContactFormNotification(payload: {
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const toEmail = 'hinobodysupport@gmail.com';
    const subject = `[HiNobody Contact] ${payload.subject}`;

    const textContent = [
      `New contact form submission`,
      ``,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Category: ${payload.category}`,
      `Subject: ${payload.subject}`,
      ``,
      `Message:`,
      payload.message,
    ].join('\n');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New contact form submission</h2>
          <table style="border-collapse: collapse;">
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold;">Name</td><td style="padding: 6px 0;">${escapeHtml(payload.name)}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold;">Email</td><td style="padding: 6px 0;">${escapeHtml(payload.email)}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold;">Category</td><td style="padding: 6px 0;">${escapeHtml(payload.category)}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold;">Subject</td><td style="padding: 6px 0;">${escapeHtml(payload.subject)}</td></tr>
          </table>
          <p style="margin-top: 12px;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
        </body>
      </html>
    `;

    await this.sendEmail(toEmail, subject, textContent, htmlContent);
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
