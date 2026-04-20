import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface CertificateData {
  learnerName: string;
  title: string;
  description?: string;
  completionDate: Date;
  instructorName: string;
  certificateNumber: string;
  verificationCode: string;
  type: 'session_completion' | 'course_completion';
  completedModules?: string[];
  totalDuration?: number;
  totalSessions?: number;
}

export class CertificateService {
  private async loadFont(pdfDoc: PDFDocument, fontType: StandardFonts): Promise<PDFFont> {
    return await pdfDoc.embedFont(fontType);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private async createSessionCompletionCertificate(data: CertificateData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    
    // Load fonts
    const titleFont = await this.loadFont(pdfDoc, StandardFonts.TimesRomanBold);
    const bodyFont = await this.loadFont(pdfDoc, StandardFonts.TimesRoman);
    const nameFont = await this.loadFont(pdfDoc, StandardFonts.TimesRomanBold);

    // Colors
    const darkBlue = rgb(0.1, 0.2, 0.4);
    const gold = rgb(0.8, 0.7, 0.2);
    const gray = rgb(0.4, 0.4, 0.4);

    // Page dimensions
    const { width, height } = page.getSize();
    const centerX = width / 2;

    // Border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: darkBlue,
      borderWidth: 3
    });

    page.drawRectangle({
      x: 60,
      y: 60,
      width: width - 120,
      height: height - 120,
      borderColor: gold,
      borderWidth: 1
    });

    // Header
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: centerX - 200,
      y: height - 120,
      size: 28,
      font: titleFont,
      color: darkBlue
    });

    // Subtitle
    page.drawText('This certifies that', {
      x: centerX - 80,
      y: height - 180,
      size: 16,
      font: bodyFont,
      color: gray
    });

    // Learner name
    page.drawText(data.learnerName, {
      x: centerX - (data.learnerName.length * 8),
      y: height - 220,
      size: 24,
      font: nameFont,
      color: darkBlue
    });

    // Achievement text
    page.drawText('has successfully completed the session', {
      x: centerX - 140,
      y: height - 270,
      size: 16,
      font: bodyFont,
      color: gray
    });

    // Session title
    page.drawText(data.title, {
      x: centerX - (data.title.length * 6),
      y: height - 310,
      size: 20,
      font: titleFont,
      color: darkBlue
    });

    // Completion date
    page.drawText(`Completed on ${this.formatDate(data.completionDate)}`, {
      x: centerX - 100,
      y: height - 370,
      size: 14,
      font: bodyFont,
      color: gray
    });

    // Instructor signature
    page.drawText('Instructor:', {
      x: 100,
      y: 150,
      size: 12,
      font: bodyFont,
      color: gray
    });

    page.drawText(data.instructorName, {
      x: 100,
      y: 130,
      size: 14,
      font: titleFont,
      color: darkBlue
    });

    // Certificate details
    page.drawText(`Certificate #: ${data.certificateNumber}`, {
      x: width - 300,
      y: 150,
      size: 10,
      font: bodyFont,
      color: gray
    });

    page.drawText(`Verification Code: ${data.verificationCode}`, {
      x: width - 300,
      y: 130,
      size: 10,
      font: bodyFont,
      color: gray
    });

    // Platform branding
    page.drawText('Meeting Matters LMS', {
      x: width - 200,
      y: 100,
      size: 12,
      font: titleFont,
      color: darkBlue
    });

    return Buffer.from(await pdfDoc.save());
  }

  private async createCourseCompletionCertificate(data: CertificateData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    
    // Load fonts
    const titleFont = await this.loadFont(pdfDoc, StandardFonts.TimesRomanBold);
    const bodyFont = await this.loadFont(pdfDoc, StandardFonts.TimesRoman);
    const nameFont = await this.loadFont(pdfDoc, StandardFonts.TimesRomanBold);

    // Colors
    const darkBlue = rgb(0.1, 0.2, 0.4);
    const gold = rgb(0.8, 0.7, 0.2);
    const gray = rgb(0.4, 0.4, 0.4);

    // Page dimensions
    const { width, height } = page.getSize();
    const centerX = width / 2;

    // Decorative border
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: darkBlue,
      borderWidth: 4
    });

    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: gold,
      borderWidth: 2
    });

    // Header
    page.drawText('COURSE COMPLETION CERTIFICATE', {
      x: centerX - 220,
      y: height - 110,
      size: 26,
      font: titleFont,
      color: darkBlue
    });

    // Subtitle
    page.drawText('This is to certify that', {
      x: centerX - 90,
      y: height - 160,
      size: 16,
      font: bodyFont,
      color: gray
    });

    // Learner name
    page.drawText(data.learnerName, {
      x: centerX - (data.learnerName.length * 8),
      y: height - 200,
      size: 24,
      font: nameFont,
      color: darkBlue
    });

    // Achievement text
    page.drawText('has successfully completed the comprehensive course', {
      x: centerX - 180,
      y: height - 240,
      size: 16,
      font: bodyFont,
      color: gray
    });

    // Course title
    page.drawText(data.title, {
      x: centerX - (data.title.length * 6),
      y: height - 280,
      size: 20,
      font: titleFont,
      color: darkBlue
    });

    // Course details
    let detailsY = height - 320;
    if (data.totalSessions) {
      page.drawText(`Completed ${data.totalSessions} sessions`, {
        x: centerX - 80,
        y: detailsY,
        size: 12,
        font: bodyFont,
        color: gray
      });
      detailsY -= 20;
    }

    if (data.totalDuration) {
      const hours = Math.floor(data.totalDuration / 60);
      const minutes = data.totalDuration % 60;
      page.drawText(`Total Duration: ${hours}h ${minutes}m`, {
        x: centerX - 70,
        y: detailsY,
        size: 12,
        font: bodyFont,
        color: gray
      });
      detailsY -= 20;
    }

    // Completion date
    page.drawText(`Completed on ${this.formatDate(data.completionDate)}`, {
      x: centerX - 100,
      y: detailsY - 20,
      size: 14,
      font: bodyFont,
      color: gray
    });

    // Instructor section
    page.drawText('Course Instructor:', {
      x: 80,
      y: 170,
      size: 12,
      font: bodyFont,
      color: gray
    });

    page.drawText(data.instructorName, {
      x: 80,
      y: 150,
      size: 14,
      font: titleFont,
      color: darkBlue
    });

    // Platform seal
    page.drawText('Meeting Matters LMS', {
      x: 80,
      y: 120,
      size: 12,
      font: titleFont,
      color: darkBlue
    });

    page.drawText('Educational Excellence Certified', {
      x: 80,
      y: 100,
      size: 10,
      font: bodyFont,
      color: gray
    });

    // Certificate details
    page.drawText(`Certificate ID: ${data.certificateNumber}`, {
      x: width - 280,
      y: 170,
      size: 10,
      font: bodyFont,
      color: gray
    });

    page.drawText(`Verification: ${data.verificationCode}`, {
      x: width - 280,
      y: 150,
      size: 10,
      font: bodyFont,
      color: gray
    });

    page.drawText(`Issued: ${this.formatDate(data.completionDate)}`, {
      x: width - 280,
      y: 130,
      size: 10,
      font: bodyFont,
      color: gray
    });

    // Completed modules (if provided)
    if (data.completedModules && data.completedModules.length > 0) {
      page.drawText('Completed Modules:', {
        x: width - 280,
        y: 100,
        size: 10,
        font: bodyFont,
        color: gray
      });

      let moduleY = 85;
      data.completedModules.slice(0, 3).forEach((module, index) => {
        page.drawText(`• ${module}`, {
          x: width - 275,
          y: moduleY,
          size: 8,
          font: bodyFont,
          color: gray
        });
        moduleY -= 12;
      });

      if (data.completedModules.length > 3) {
        page.drawText(`+ ${data.completedModules.length - 3} more...`, {
          x: width - 275,
          y: moduleY,
          size: 8,
          font: bodyFont,
          color: gray
        });
      }
    }

    return Buffer.from(await pdfDoc.save());
  }

  async generateCertificate(data: CertificateData): Promise<Buffer> {
    if (data.type === 'session_completion') {
      return await this.createSessionCompletionCertificate(data);
    } else {
      return await this.createCourseCompletionCertificate(data);
    }
  }

  generateCertificateNumber(): string {
    const prefix = 'MM-CERT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  generateVerificationCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  }

  async saveCertificatePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'public', 'certificates');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
    
    return `/certificates/${filename}`;
  }
}

export const certificateService = new CertificateService();