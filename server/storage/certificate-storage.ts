import { db } from "../db";
import { certificates, courses, users } from "@shared/schema";
import type { Certificate } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export class CertificateStorage {
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const results = await db
      .select({
        id: certificates.id,
        userId: certificates.userId,
        courseId: certificates.courseId,
        bundleId: certificates.bundleId,
        moduleContentId: certificates.moduleContentId,
        type: certificates.type,
        certificateNumber: certificates.certificateNumber,
        title: certificates.title,
        description: certificates.description,
        completionDate: certificates.completionDate,
        totalDuration: certificates.totalDuration,
        totalSessions: certificates.totalSessions,
        instructorName: certificates.instructorName,
        completedModules: certificates.completedModules,
        pdfUrl: certificates.pdfUrl,
        emailSent: certificates.emailSent,
        emailSentAt: certificates.emailSentAt,
        issueDate: certificates.issueDate,
        verificationCode: certificates.verificationCode,
        createdAt: certificates.createdAt,
        updatedAt: certificates.updatedAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, userId));
    
    return results as Certificate[];
  }

  async getCertificateById(certificateId: string, userId?: string): Promise<Certificate | null> {
    const conditions = [eq(certificates.id, certificateId)];
    
    if (userId) {
      conditions.push(eq(certificates.userId, userId));
    }

    const result = await db
      .select()
      .from(certificates)
      .where(and(...conditions));
      
    return result[0] || null;
  }

  async createCertificate(certificateData: {
    userId: string;
    courseId?: string;
    bundleId?: string;
    moduleContentId?: string;
    title: string;
    description?: string;
    type: "session_completion" | "course_completion";
    instructorName: string;
    completedModules?: string;
    totalDuration?: number;
    totalSessions?: number;
  }): Promise<Certificate> {
    const newCertificate = {
      id: uuidv4(),
      userId: certificateData.userId,
      courseId: certificateData.courseId || null,
      bundleId: certificateData.bundleId || null,
      moduleContentId: certificateData.moduleContentId || null,
      type: certificateData.type,
      certificateNumber: this.generateCertificateNumber(),
      title: certificateData.title,
      description: certificateData.description || null,
      completionDate: new Date(),
      totalDuration: certificateData.totalDuration || null,
      totalSessions: certificateData.totalSessions || null,
      instructorName: certificateData.instructorName,
      completedModules: certificateData.completedModules || null,
      pdfUrl: null,
      emailSent: false,
      emailSentAt: null,
      issueDate: new Date(),
      verificationCode: this.generateVerificationCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(certificates).values([newCertificate]);
    return newCertificate as Certificate;
  }

  async generateCertificateHtml(certificate: Certificate): Promise<string> {
    // Get additional data for certificate
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, certificate.userId))
      .then(result => result[0]);

    if (!user) {
      throw new Error("User not found for certificate");
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - ${certificate.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background-color: #f5f5f5;
            color: #333;
          }
          .certificate {
            max-width: 800px;
            margin: 0 auto;
            padding: 60px;
            border: 3px solid #2c3e50;
            border-radius: 15px;
            text-align: center;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .certificate-subtitle {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          .recipient-name {
            font-size: 36px;
            font-weight: bold;
            color: #e74c3c;
            margin: 30px 0;
            text-decoration: underline;
          }
          .course-title {
            font-size: 24px;
            font-style: italic;
            margin: 20px 0;
            color: #34495e;
          }
          .certificate-details {
            margin: 40px 0;
            font-size: 16px;
            line-height: 1.6;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .signature {
            text-align: center;
            min-width: 200px;
          }
          .signature-line {
            border-top: 2px solid #34495e;
            margin-bottom: 5px;
          }
          .date {
            font-size: 14px;
            color: #7f8c8d;
          }
          .certificate-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #95a5a6;
          }
          .verification-code {
            margin-top: 30px;
            font-size: 12px;
            color: #95a5a6;
          }
        </style>
      </head>
      <body>
        <div class="certificate-number">Certificate No: ${certificate.certificateNumber}</div>
        <div class="certificate">
          <div class="certificate-title">Certificate of Achievement</div>
          <div class="certificate-subtitle">This is to certify that</div>
          
          <div class="recipient-name">${userName}</div>
          
          <div class="certificate-subtitle">has successfully completed</div>
          <div class="course-title">${certificate.title}</div>
          
          <div class="certificate-details">
            ${certificate.description || 'This achievement represents dedication to learning and professional development.'}
          </div>
          
          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div><strong>${certificate.instructorName}</strong></div>
              <div>Instructor</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div><strong>Meeting Matters LMS</strong></div>
              <div>Organization</div>
            </div>
          </div>
          
          <div class="date">
            Issued on ${(certificate.issueDate || new Date()).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div class="verification-code">
            Verification Code: ${certificate.verificationCode}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generateCertificatePdf(certificate: Certificate): Promise<Buffer> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]); // Letter size landscape
    
    // Get fonts
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, certificate.userId))
      .then(result => result[0]);

    if (!user) {
      throw new Error("User not found for certificate");
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    // Colors
    const titleColor = rgb(0.17, 0.24, 0.31); // #2c3e50
    const nameColor = rgb(0.91, 0.30, 0.24); // #e74c3c
    const textColor = rgb(0.20, 0.29, 0.37); // #34495e
    const subtleColor = rgb(0.58, 0.65, 0.68); // #95a5a6
    
    // Draw border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: 692,
      height: 512,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 3,
    });
    
    // Title
    page.drawText('CERTIFICATE OF ACHIEVEMENT', {
      x: 396 - (timesBoldFont.widthOfTextAtSize('CERTIFICATE OF ACHIEVEMENT', 36) / 2),
      y: 450,
      size: 36,
      font: timesBoldFont,
      color: titleColor,
    });
    
    // Subtitle
    page.drawText('This is to certify that', {
      x: 396 - (timesFont.widthOfTextAtSize('This is to certify that', 18) / 2),
      y: 400,
      size: 18,
      font: timesFont,
      color: textColor,
    });
    
    // Recipient name
    page.drawText(userName, {
      x: 396 - (timesBoldFont.widthOfTextAtSize(userName, 28) / 2),
      y: 350,
      size: 28,
      font: timesBoldFont,
      color: nameColor,
    });
    
    // Course completion text
    page.drawText('has successfully completed', {
      x: 396 - (timesFont.widthOfTextAtSize('has successfully completed', 16) / 2),
      y: 310,
      size: 16,
      font: timesFont,
      color: textColor,
    });
    
    // Course title
    const courseTitle = certificate.title;
    page.drawText(courseTitle, {
      x: 396 - (timesBoldFont.widthOfTextAtSize(courseTitle, 20) / 2),
      y: 270,
      size: 20,
      font: timesBoldFont,
      color: textColor,
    });
    
    // Description if available
    if (certificate.description) {
      const description = certificate.description.length > 80 
        ? certificate.description.substring(0, 80) + '...' 
        : certificate.description;
      page.drawText(description, {
        x: 396 - (timesFont.widthOfTextAtSize(description, 12) / 2),
        y: 230,
        size: 12,
        font: timesFont,
        color: textColor,
      });
    }
    
    // Signature lines and names
    // Instructor signature
    page.drawLine({
      start: { x: 150, y: 160 },
      end: { x: 290, y: 160 },
      thickness: 1,
      color: textColor,
    });
    page.drawText(certificate.instructorName, {
      x: 220 - (timesBoldFont.widthOfTextAtSize(certificate.instructorName, 12) / 2),
      y: 140,
      size: 12,
      font: timesBoldFont,
      color: textColor,
    });
    page.drawText('Instructor', {
      x: 220 - (timesFont.widthOfTextAtSize('Instructor', 10) / 2),
      y: 125,
      size: 10,
      font: timesFont,
      color: textColor,
    });
    
    // Organization signature
    page.drawLine({
      start: { x: 502, y: 160 },
      end: { x: 642, y: 160 },
      thickness: 1,
      color: textColor,
    });
    const orgName = "Meeting Matters LMS";
    page.drawText(orgName, {
      x: 572 - (timesBoldFont.widthOfTextAtSize(orgName, 12) / 2),
      y: 140,
      size: 12,
      font: timesBoldFont,
      color: textColor,
    });
    page.drawText('Organization', {
      x: 572 - (timesFont.widthOfTextAtSize('Organization', 10) / 2),
      y: 125,
      size: 10,
      font: timesFont,
      color: textColor,
    });
    
    // Issue date
    const issueDate = certificate.issueDate || new Date();
    const dateText = `Issued on ${issueDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    page.drawText(dateText, {
      x: 396 - (timesFont.widthOfTextAtSize(dateText, 12) / 2),
      y: 100,
      size: 12,
      font: timesFont,
      color: textColor,
    });
    
    // Certificate number (top right)
    const certNumber = `Certificate No: ${certificate.certificateNumber}`;
    page.drawText(certNumber, {
      x: 742 - timesFont.widthOfTextAtSize(certNumber, 8),
      y: 580,
      size: 8,
      font: timesFont,
      color: subtleColor,
    });
    
    // Verification code (bottom center)
    const verificationText = `Verification Code: ${certificate.verificationCode}`;
    page.drawText(verificationText, {
      x: 396 - (timesFont.widthOfTextAtSize(verificationText, 8) / 2),
      y: 70,
      size: 8,
      font: timesFont,
      color: subtleColor,
    });
    
    // Save the PDF
    return Buffer.from(await pdfDoc.save());
  }

  private generateCertificateNumber(): string {
    const prefix = "CERT";
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  async revokeCertificate(certificateId: string, reason?: string): Promise<void> {
    await db.update(certificates)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, certificateId));
  }

  async verifyCertificate(verificationCode: string): Promise<Certificate | null> {
    const result = await db
      .select()
      .from(certificates)
      .where(eq(certificates.verificationCode, verificationCode));

    return result[0] || null;
  }
}