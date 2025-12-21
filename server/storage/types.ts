// Additional types that are missing from schema but used in storage
export interface PersonalNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleDto {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  courses: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseBundle {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDto {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  status: string;
  totalAmount: number;
  currency: string;
  promoCode?: string;
  discountAmount?: number;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentMonitoringDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  lastActive: Date;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalTimeSpent: number;
  averageProgress: number;
}

export interface ActivitySummaryDto {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  averageTimeSpent: number;
  completionRate: number;
}

export interface CourseProgressDto {
  courseId: string;
  courseTitle: string;
  progress: number;
  enrollmentDate: Date;
  lastAccessed: Date;
  completedModules: number;
  totalModules: number;
}

export interface StudentSession {
  id: string;
  userId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  duration?: number;
  contentAccessed: string[];
}

export interface ContentActivity {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  timeSpent: number;
  completed: boolean;
  lastAccessed: Date;
}

export interface QuizPerformance {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  maxScore: number;
  attemptsUsed: number;
  completedAt: Date;
}

export interface TourSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourSettings {
  id: string;
  isEnabled: boolean;
  welcomeMessage: string;
  completionMessage: string;
  updatedAt: Date;
}

export interface LibraryContent {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  categoryId?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryContentAccess {
  id: string;
  contentId: string;
  userId: string;
  accessedAt: Date;
}

export interface LibraryContentView {
  id: string;
  contentId: string;
  userId: string;
  viewedAt: Date;
  duration?: number;
}

// Extended certificate interface with missing properties
export interface CertificateExtended {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: "session_completion" | "course_completion";
  certificateNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  instructorName: string;
  instructorSignature?: string;
  organizationName: string;
  organizationLogo?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  templateId?: string;
  verificationCode: string;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties used in the code
  userName: string;
  courseTitle: string;
  completionDate: Date;
}

// Role types to fix enum issues
export type UserRole = "admin" | "instructor" | "learner";
export type CourseStatus = "draft" | "published" | "archived";
export type EnrollmentStatus = "not_started" | "in_progress" | "completed";