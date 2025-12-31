import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private emailProvider: typeof sgMail;
  private emailSender: string;
  private readonly mailjetUrl = 'https://api.mailjet.com/v3.1/send';

  constructor() {
    this.emailProvider = sgMail;
    this.emailSender = process.env.VERIFIED_EMAIL_SENDER;
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    mailText: string,
    html?: string,
  ): Promise<any> {
    const token = Buffer.from(
      `${process.env.MJ_APIKEY_PUBLIC}:${process.env.MJ_APIKEY_PRIVATE}`,
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    };

    const body = {
      Messages: [
        {
          From: { Email: this.emailSender, Name: 'Task Manager' },
          To: [{ Email: toEmail }],
          Subject: subject,
          TextPart: mailText,
          HTMLPart: html
        },
      ],
    };

    try {
      const response = await axios.post(this.mailjetUrl, body, { headers });
      return response.data;
    } catch (error: any) {
      const details = error.response?.data || error.message;
      throw new Error(`Mailjet API error: ${JSON.stringify(details)}`);
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

    return this.sendEmail(email, subject, htmlContent);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    nickname?: string,
  ): Promise<boolean> {
    const subject = 'Reset Your Password';

    const frontendUrl = `${process.env.FRONTEND_URL}` || "http://localhost:3000"

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

    return this.sendEmail(email, subject, htmlContent);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
