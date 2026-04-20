import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Initialize Resend once
const resend = new Resend(process.env.RESEND_API_KEY);

// Debug at startup (you should see this on server restart)
console.log('[RESEND-INIT] Resend initialized. API Key present:', !!process.env.RESEND_API_KEY);
console.log('[RESEND-INIT] Key starts with:', process.env.RESEND_API_KEY?.substring(0, 5) || '(missing)');

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('[RESEND] Preparing to send email to:', options.to);
    console.log('[RESEND] Subject:', options.subject);

    // Simulation mode if no API key
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 EMAIL SIMULATION MODE (no RESEND_API_KEY in .env)');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text preview:', options.text.substring(0, 200) + '...');
      console.log('HTML preview:', options.html.substring(0, 200) + '...');
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
        // ← Resend's official test sender (no verification needed)
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend API error:', error.message);
      return false;
    }

    console.log(`✅ Resend email sent successfully to ${options.to}`);
    console.log('[RESEND] Message ID:', data?.id);
    return true;
  } catch (err) {
    console.error('❌ Email sending crashed (Resend):', err);
    return false;
  }
}

export interface PurchaseEmailData {
  userEmail: string;
  userName: string;
  itemType: 'course' | 'bundle';
  itemTitle: string;
  totalAmount: number;
  originalAmount: number;
  discountAmount: number;
  promoCode?: string;
  courses: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  orderDate: string;
}

export class EmailService {
  async sendPurchaseConfirmation(data: PurchaseEmailData): Promise<boolean> {
    try {
      const template = this.generatePurchaseConfirmationTemplate(data);
      console.log('[PURCHASE-EMAIL] Sending to:', data.userEmail);

      const success = await sendEmail({
        to: data.userEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      return success;
    } catch (error) {
      console.error('[PURCHASE-EMAIL] Failed:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
    try {
      console.log('[PASSWORD-RESET] Preparing email for:', to);

      const subject = "Reset Your Meeting Matters Password";

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">Reset Your Password</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2>Hello ${name || 'there'},</h2>
      <p>We received a request to reset your password. Click the button below to set a new one:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
      </div>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      
      <p style="color: #dc2626; font-size: 14px; margin-top: 30px; text-align: center;">
        Never share this link with anyone.
      </p>
    </div>
    <div style="background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
      <p>Meeting Matters LMS – Empowering Your Professional Growth</p>
      <p>If you need help, contact support@meetingmatters.com</p>
    </div>
  </div>
</body>
</html>`;

      const text = `
Reset Your Meeting Matters Password

Hello ${name || 'there'},

We received a request to reset your password.

Click here to reset: ${resetLink}

This link expires in 1 hour.

If you didn't request this, ignore this email.

Never share this link with anyone.

Meeting Matters LMS
support@meetingmatters.com
      `;

      const success = await sendEmail({
        to,
        subject,
        text,
        html,
      });

      if (success) {
        console.log(`[PASSWORD-RESET] SUCCESS - Email sent to ${to}`);
      } else {
        console.log(`[PASSWORD-RESET] FAILED to send to ${to}`);
      }

      return success;
    } catch (error) {
      console.error('[PASSWORD-RESET] Exception:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    try {
      const subject = "🎉 Welcome to Meeting Matters LMS!";

      const html = `...`; // ← paste your original welcome HTML here (keep it)

      const text = `...`; // ← paste your original text here

      console.log('[WELCOME-EMAIL] Sending to:', userEmail);

      return sendEmail({
        to: userEmail,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('[WELCOME-EMAIL] Failed:', error);
      return false;
    }
  }

  async sendInstructorWelcomeEmail(data: {
    email: string;
    firstName: string;
    tempPassword: string;
    loginUrl: string;
    adminName: string;
  }): Promise<boolean> {
    try {
      const template = this.generateInstructorWelcomeTemplate(data);
      console.log('[INSTRUCTOR-WELCOME] Sending to:', data.email);
      return sendEmail({
        to: data.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (error) {
      console.error('[INSTRUCTOR-WELCOME] Failed:', error);
      return false;
    }
  }

  private generateInstructorWelcomeTemplate(data: {
    email: string;
    firstName: string;
    tempPassword: string;
    loginUrl: string;
    adminName: string;
  }): EmailTemplate {
    // ← paste your original instructor template code here (keep it)
    const subject = "🎓 Welcome to Meeting Matters LMS - Instructor Account Created";

    const html = `...`; // your HTML
    const text = `...`; // your text

    return { subject, html, text };
  }

  private generatePurchaseConfirmationTemplate(data: PurchaseEmailData): EmailTemplate {
    // ← paste your original purchase template code here (keep it)
    const isBundle = data.itemType === 'bundle';
    const isFree = data.totalAmount === 0;
    const hasDiscount = data.discountAmount > 0;

    const subject = isFree 
      ? `🎉 Welcome! Your free access to ${data.itemTitle} is ready`
      : `🎉 Purchase Confirmed: ${data.itemTitle}`;

    const html = `...`; // your long HTML
    const text = `...`; // your text version

    return { subject, html, text };
  }
}

export const emailService = new EmailService();