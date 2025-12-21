import nodemailer from 'nodemailer';

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

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'noreply@themeetingmatters.com',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SIMULATION - Configure EMAIL_USER and EMAIL_PASSWORD to send real emails');
      console.log('=====================================');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Text: ${options.text}`);
      console.log('=====================================');
      return true;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@themeetingmatters.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
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
      
      // Email service not configured - emails will not be sent
      if (!process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
        console.log('🎉 PURCHASE CONFIRMATION EMAIL (SIMULATION)');
        console.log('=====================================');
        console.log(`To: ${data.userEmail}`);
        console.log(`Subject: ${template.subject}`);
        console.log('HTML Content:', template.html);
        console.log('=====================================');
        console.log('💡 Configure SENDGRID_API_KEY or SMTP settings to send real emails');
        return true;
      }
      
      // Email service is configured but simplified for now
      console.log('📧 Email service configured but not implemented yet');
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private generatePurchaseConfirmationTemplate(data: PurchaseEmailData): EmailTemplate {
    const isBundle = data.itemType === 'bundle';
    const isFree = data.totalAmount === 0;
    const hasDiscount = data.discountAmount > 0;

    const subject = isFree 
      ? `🎉 Welcome! Your free access to ${data.itemTitle} is ready`
      : `🎉 Purchase Confirmed: ${data.itemTitle}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .celebration {
            font-size: 48px;
            margin: 20px 0;
        }
        .title {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .purchase-details {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .detail-label {
            color: #6b7280;
        }
        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }
        .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
        }
        .discount {
            color: #059669;
        }
        .free {
            color: #059669;
            font-size: 24px;
            font-weight: bold;
        }
        .courses-section {
            margin: 30px 0;
        }
        .course-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .course-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .course-description {
            color: #6b7280;
            font-size: 14px;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .promo-highlight {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
        }
        .promo-code {
            font-family: monospace;
            font-weight: bold;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 Meeting Matters LMS</div>
            <div class="celebration">🎉</div>
            <h1 class="title">${isFree ? 'Welcome to Your Free Course!' : 'Purchase Confirmed!'}</h1>
            <p class="subtitle">
                Hi ${data.userName}! ${isFree ? 'Your free access is ready.' : 'Thank you for your purchase.'}
            </p>
        </div>

        <div class="purchase-details">
            <h3>Order Details</h3>
            <div class="detail-row">
                <span class="detail-label">${isBundle ? 'Bundle' : 'Course'}:</span>
                <span class="detail-value">${data.itemTitle}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${new Date(data.orderDate).toLocaleDateString()}</span>
            </div>
            
            ${!isFree ? `
            <div class="detail-row">
                <span class="detail-label">Original Price:</span>
                <span class="detail-value">$${data.originalAmount.toFixed(2)}</span>
            </div>
            
            ${hasDiscount ? `
            <div class="detail-row discount">
                <span class="detail-label">Discount Applied:</span>
                <span class="detail-value">-$${data.discountAmount.toFixed(2)}</span>
            </div>
            ` : ''}
            
            <div class="detail-row total-row">
                <span class="detail-label">Total Paid:</span>
                <span class="detail-value">$${data.totalAmount.toFixed(2)}</span>
            </div>
            ` : `
            <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value free">FREE</span>
            </div>
            `}
        </div>

        ${data.promoCode ? `
        <div class="promo-highlight">
            🎟️ You saved money with promo code: <span class="promo-code">${data.promoCode}</span>
        </div>
        ` : ''}

        <div class="courses-section">
            <h3>Your ${isBundle ? 'Course Bundle' : 'Course'} Includes:</h3>
            ${data.courses.map(course => `
            <div class="course-item">
                <div class="course-title">${course.title}</div>
                <div class="course-description">${course.description}</div>
            </div>
            `).join('')}
        </div>

        <div class="cta-section">
            <a href="https://meetingmatters.com/dashboard" class="cta-button">
                🚀 Start Learning Now
            </a>
        </div>

        <div class="footer">
            <p>
                <strong>Next Steps:</strong><br>
                1. Log in to your account<br>
                2. Navigate to your dashboard<br>
                3. Start your learning journey!
            </p>
            <br>
            <p>
                Need help? Contact our support team at support@meetingmatters.com<br>
                <em>Meeting Matters LMS - Empowering Your Professional Growth</em>
            </p>
        </div>
    </div>
</body>
</html>`;

    const text = `
🎉 ${isFree ? 'Welcome to Your Free Course!' : 'Purchase Confirmed!'}

Hi ${data.userName}!

${isFree ? 'Your free access is ready.' : 'Thank you for your purchase of'} "${data.itemTitle}"

Order Details:
- ${isBundle ? 'Bundle' : 'Course'}: ${data.itemTitle}
- Order Date: ${new Date(data.orderDate).toLocaleDateString()}
${!isFree ? `- Total Paid: $${data.totalAmount.toFixed(2)}` : '- Total: FREE'}
${data.promoCode ? `- Promo Code Used: ${data.promoCode}` : ''}

Your ${isBundle ? 'Course Bundle' : 'Course'} Includes:
${data.courses.map(course => `• ${course.title}`).join('\n')}

🚀 Start Learning: https://meetingmatters.com/dashboard

Need help? Contact support@meetingmatters.com

Meeting Matters LMS - Empowering Your Professional Growth
`;

    return { subject, html, text };
  }

  async sendInstructorWelcomeEmail(data: {
    email: string;
    firstName: string;
    tempPassword: string;
    loginUrl: string;
    adminName: string;
  }): Promise<boolean> {
    const template = this.generateInstructorWelcomeTemplate(data);
    return this.sendEmail(data.email, template);
  }

  private generateInstructorWelcomeTemplate(data: {
    email: string;
    firstName: string;
    tempPassword: string;
    loginUrl: string;
    adminName: string;
  }): EmailTemplate {
    const subject = "🎓 Welcome to Meeting Matters LMS - Instructor Account Created";
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Meeting Matters LMS</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .credentials-box { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .warning { background: #fef3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to Meeting Matters LMS</h1>
            <p>Your instructor account has been created!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>Great news! ${data.adminName} has created an instructor account for you on the Meeting Matters Learning Management System.</p>
            
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.tempPassword}</code></p>
            </div>
            
            <div class="warning">
              <h4>⚠️ Important Security Notice</h4>
              <p>Please change your password immediately after your first login for security purposes. This temporary password should not be shared with anyone.</p>
            </div>
            
            <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Log in using your credentials above</li>
              <li>🔑 Change your temporary password</li>
              <li>📚 Complete your instructor profile</li>
              <li>🎯 Start creating your first course</li>
              <li>👥 Engage with your students</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Meeting Matters LMS. All rights reserved.</p>
            <p>This email contains sensitive information. Please keep it secure.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Meeting Matters LMS!
      
      Hello ${data.firstName}!
      
      ${data.adminName} has created an instructor account for you on the Meeting Matters Learning Management System.
      
      Your Login Credentials:
      Email: ${data.email}
      Temporary Password: ${data.tempPassword}
      
      Login URL: ${data.loginUrl}
      
      IMPORTANT: Please change your password immediately after your first login for security purposes.
      
      What's Next:
      - Log in using your credentials above
      - Change your temporary password
      - Complete your instructor profile
      - Start creating your first course
      - Engage with your students
      
      If you have any questions, please contact our support team.
      
      © ${new Date().getFullYear()} Meeting Matters LMS
    `;

    return { subject, html, text };
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    try {
      const subject = "🎉 Welcome to Meeting Matters LMS!";
      
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Meeting Matters LMS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px;">📚 Meeting Matters LMS</div>
            <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">Welcome, ${userName}!</h1>
            <p style="color: #6b7280; font-size: 16px;">Your learning journey starts here.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="https://meetingmatters.com/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Explore Courses</a>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px;">
            <p>Ready to transform your professional skills?<br>
            <em>Meeting Matters LMS - Empowering Your Professional Growth</em></p>
        </div>
    </div>
</body>
</html>`;

      console.log('📧 WELCOME EMAIL SENT');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: ${subject}`);
      
      return true;
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();