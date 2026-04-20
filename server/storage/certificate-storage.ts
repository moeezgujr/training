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
    const fs = await import("fs");
    const path = await import("path");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const user = await db.select().from(users).where(eq(users.id, certificate.userId)).then(r => r[0]);
    if (!user) throw new Error("User not found for certificate");

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const courseName = certificate.title.replace(' - Certificate of Completion', '');
    const issueDate = (certificate.issueDate || new Date()).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const white = rgb(1, 1, 1);
    const dark = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.5, 0.5, 0.5);
    const gold = rgb(0.82, 0.67, 0.16);
    const blue = rgb(0.15, 0.25, 0.55);
    const red = rgb(0.75, 0.1, 0.1);
    const green = rgb(0.1, 0.55, 0.2);
    const yellow = rgb(0.95, 0.75, 0.1);

    // White background
    page.drawRectangle({ x: 0, y: 0, width, height, color: white });

    // Outer gold border
    page.drawRectangle({ x: 0, y: 0, width, height, borderColor: gold, borderWidth: 8, color: white });

    // Corner decorations - top left (blue + yellow stripe)
    page.drawRectangle({ x: 0, y: height - 140, width: 80, height: 140, color: blue });
    page.drawRectangle({ x: 80, y: height - 140, width: 20, height: 140, color: yellow });

    // Corner decorations - top right (red + yellow stripe)
    page.drawRectangle({ x: width - 80, y: height - 140, width: 80, height: 140, color: red });
    page.drawRectangle({ x: width - 100, y: height - 140, width: 20, height: 140, color: yellow });

    // Corner decorations - bottom left (green + yellow stripe)
    page.drawRectangle({ x: 0, y: 0, width: 80, height: 140, color: green });
    page.drawRectangle({ x: 80, y: 0, width: 20, height: 140, color: yellow });

    // Corner decorations - bottom right (blue + yellow stripe)
    page.drawRectangle({ x: width - 80, y: 0, width: 80, height: 140, color: blue });
    page.drawRectangle({ x: width - 100, y: 0, width: 20, height: 140, color: yellow });

    // Inner gold border
    page.drawRectangle({ x: 105, y: 25, width: width - 210, height: height - 50, borderColor: gold, borderWidth: 2, color: white });

    // Logo watermark in background
    try {
      const logoPath = path.join(process.cwd(), 'server', 'templates', 'LOGO.png');
      const logoBytes = fs.readFileSync(logoPath);
      const logoWatermark = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoWatermark, {
        x: width / 2 - 160,
        y: height / 2 - 150,
        width: 320,
        height: 300,
        opacity: 0.1,
      });
    } catch (e) {}

    // Top logo
    try {
      const logoPath = path.join(process.cwd(), 'server', 'templates', 'LOGO.png');
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scaleToFit(75, 75);
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - 95,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch (e: any) {
      console.error('[CERT] Logo embed error:', e.message);
    }

    // Company name below logo
    page.drawText('MEETING MATTERS', {
      x: width/2 - helveticaBoldFont.widthOfTextAtSize('MEETING MATTERS', 10)/2,
      y: height - 108, size: 10, font: helveticaBoldFont, color: rgb(0.1, 0.5, 0.7)
    });
    page.drawText('WE DEAL BEHAVIOURS', {
      x: width/2 - helveticaFont.widthOfTextAtSize('WE DEAL BEHAVIOURS', 7)/2,
      y: height - 119, size: 7, font: helveticaFont, color: gray
    });

    // CERTIFICATE title
    const certText = 'CERTIFICATE';
    page.drawText(certText, {
      x: width/2 - timesBoldFont.widthOfTextAtSize(certText, 48)/2,
      y: height - 170, size: 48, font: timesBoldFont, color: dark
    });

    // OF COMPLETION with lines
    const ofComp = 'OF COMPLETION';
    const ofCompW = helveticaFont.widthOfTextAtSize(ofComp, 14);
    const lineY = height - 192;
    page.drawLine({ start: { x: 115, y: lineY }, end: { x: width/2 - ofCompW/2 - 12, y: lineY }, color: blue, thickness: 1 });
    page.drawText(ofComp, { x: width/2 - ofCompW/2, y: lineY - 5, size: 14, font: helveticaFont, color: gray });
    page.drawLine({ start: { x: width/2 + ofCompW/2 + 12, y: lineY }, end: { x: width - 115, y: lineY }, color: blue, thickness: 1 });

    // Presented to
    const presText = 'Presented to';
    page.drawText(presText, {
      x: width/2 - helveticaFont.widthOfTextAtSize(presText, 12)/2,
      y: height - 222, size: 12, font: helveticaFont, color: gray
    });

    // Recipient name
    const nameSize = 36;
    const nameW = timesBoldFont.widthOfTextAtSize(userName, nameSize);
    page.drawText(userName, {
      x: width/2 - nameW/2,
      y: height - 268, size: nameSize, font: timesBoldFont, color: dark
    });

    // Underline name
    page.drawLine({
      start: { x: width/2 - nameW/2, y: height - 274 },
      end: { x: width/2 + nameW/2, y: height - 274 },
      color: dark, thickness: 1
    });

    // for completing the course
    page.drawText('for completing the course', {
      x: width/2 - helveticaFont.widthOfTextAtSize('for completing the course', 12)/2,
      y: height - 308, size: 12, font: helveticaFont, color: gray
    });

    // Course name
    const cnW = helveticaBoldFont.widthOfTextAtSize(courseName, 18);
    page.drawText(courseName, {
      x: width/2 - cnW/2,
      y: height - 338, size: 18, font: helveticaBoldFont, color: dark
    });

    // Signature line left
    page.drawLine({ start: { x: 115, y: 115 }, end: { x: 300, y: 115 }, color: gold, thickness: 1.5 });
    page.drawText(certificate.instructorName, { x: 115, y: 98, size: 11, font: helveticaBoldFont, color: dark });
    page.drawText('Clinic Director', { x: 115, y: 83, size: 10, font: helveticaFont, color: gray });

    // Date right
    page.drawText(issueDate, { x: width - 215, y: 120, size: 14, font: helveticaBoldFont, color: dark });
    page.drawLine({ start: { x: width - 225, y: 113 }, end: { x: width - 105, y: 113 }, color: gold, thickness: 1.5 });
    page.drawText('Date', { x: width - 175, y: 98, size: 10, font: helveticaFont, color: gray });

    // Verification
    const verifyText = `Cert: ${certificate.certificateNumber}  |  Verify: ${certificate.verificationCode}`;
    page.drawText(verifyText, {
      x: width/2 - helveticaFont.widthOfTextAtSize(verifyText, 8)/2,
      y: 32, size: 8, font: helveticaFont, color: rgb(0.7, 0.7, 0.7)
    });

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