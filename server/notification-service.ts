import { sendEmail } from './email-service';

const ADMIN_EMAIL = 'hr@themeetingmatters.com';
const SYSTEM_NAME = 'Meeting Matters LMS';

interface NotificationData {
  studentName?: string;
  studentEmail?: string;
  teacherName?: string;
  teacherEmail?: string;
  courseName?: string;
  actionType: string;
  details?: any;
}

export async function sendAdminNotification(data: NotificationData) {
  try {
    let subject = '';
    let htmlContent = '';
    let textContent = '';

    switch (data.actionType) {
      case 'student_registration':
        subject = `New Student Registration - ${data.studentName || data.studentEmail}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Student Registration</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Student Name:</strong> ${data.studentName || 'Not provided'}</p>
              <p><strong>Email:</strong> ${data.studentEmail}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>Please review the new registration in the admin dashboard.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `New Student Registration\n\nStudent: ${data.studentName || 'Not provided'}\nEmail: ${data.studentEmail}\nDate: ${new Date().toLocaleString()}\n\nPlease review the new registration in the admin dashboard.`;
        break;

      case 'course_enrollment':
        subject = `Course Enrollment - ${data.studentName || data.studentEmail} enrolled in ${data.courseName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Course Enrollment</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Student:</strong> ${data.studentName || data.studentEmail}</p>
              <p><strong>Email:</strong> ${data.studentEmail}</p>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Enrollment Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Enrollment Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>The student has successfully enrolled in the course.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `Course Enrollment\n\nStudent: ${data.studentName || data.studentEmail}\nEmail: ${data.studentEmail}\nCourse: ${data.courseName}\nDate: ${new Date().toLocaleString()}\n\nThe student has successfully enrolled in the course.`;
        break;

      case 'assignment_submission':
        subject = `Assignment Submitted - ${data.studentName || data.studentEmail}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Assignment Submission</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Student:</strong> ${data.studentName || data.studentEmail}</p>
              <p><strong>Email:</strong> ${data.studentEmail}</p>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Submission Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>A new assignment has been submitted and is ready for review.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `Assignment Submission\n\nStudent: ${data.studentName || data.studentEmail}\nEmail: ${data.studentEmail}\nCourse: ${data.courseName}\nDate: ${new Date().toLocaleString()}\n\nA new assignment has been submitted and is ready for review.`;
        break;

      case 'instructor_registration':
        subject = `New Instructor Registration - ${data.teacherName || data.teacherEmail}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Instructor Registration</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Instructor Name:</strong> ${data.teacherName || 'Not provided'}</p>
              <p><strong>Email:</strong> ${data.teacherEmail}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>Please review and approve the new instructor registration in the admin dashboard.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `New Instructor Registration\n\nInstructor: ${data.teacherName || 'Not provided'}\nEmail: ${data.teacherEmail}\nDate: ${new Date().toLocaleString()}\n\nPlease review and approve the new instructor registration in the admin dashboard.`;
        break;

      case 'course_creation':
        subject = `New Course Created - ${data.courseName} by ${data.teacherName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Course Created</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Course Name:</strong> ${data.courseName}</p>
              <p><strong>Instructor:</strong> ${data.teacherName}</p>
              <p><strong>Instructor Email:</strong> ${data.teacherEmail}</p>
              <p><strong>Creation Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Creation Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>A new course has been created and may need approval before publishing.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `New Course Created\n\nCourse: ${data.courseName}\nInstructor: ${data.teacherName}\nEmail: ${data.teacherEmail}\nDate: ${new Date().toLocaleString()}\n\nA new course has been created and may need approval before publishing.`;
        break;

      default:
        subject = `${SYSTEM_NAME} - User Activity Notification`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">User Activity Notification</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Activity:</strong> ${data.actionType}</p>
              <p><strong>User:</strong> ${data.studentName || data.teacherName || data.studentEmail || data.teacherEmail}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <p>Please review this activity in the admin dashboard.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ${SYSTEM_NAME}.
            </p>
          </div>
        `;
        textContent = `User Activity Notification\n\nActivity: ${data.actionType}\nUser: ${data.studentName || data.teacherName || data.studentEmail || data.teacherEmail}\nDate: ${new Date().toLocaleString()}\n\nPlease review this activity in the admin dashboard.`;
    }

    await sendEmail({
      to: ADMIN_EMAIL,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`Admin notification sent for: ${data.actionType}`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

// Helper functions for common notifications
export async function notifyStudentRegistration(studentEmail: string, studentName?: string) {
  await sendAdminNotification({
    actionType: 'student_registration',
    studentEmail,
    studentName
  });
}

export async function notifyCourseEnrollment(studentEmail: string, courseName: string, studentName?: string) {
  await sendAdminNotification({
    actionType: 'course_enrollment',
    studentEmail,
    studentName,
    courseName
  });
}

export async function notifyAssignmentSubmission(studentEmail: string, courseName: string, studentName?: string) {
  await sendAdminNotification({
    actionType: 'assignment_submission',
    studentEmail,
    studentName,
    courseName
  });
}

export async function notifyInstructorRegistration(teacherEmail: string, teacherName?: string) {
  await sendAdminNotification({
    actionType: 'instructor_registration',
    teacherEmail,
    teacherName
  });
}

export async function notifyCourseCreation(teacherEmail: string, courseName: string, teacherName?: string) {
  await sendAdminNotification({
    actionType: 'course_creation',
    teacherEmail,
    teacherName,
    courseName
  });
}