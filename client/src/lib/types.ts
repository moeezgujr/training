export type UserRole = 'admin' | 'instructor' | 'learner';

export interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  content: ModuleContent[];
  quizzes: Quiz[];
  assignments: Assignment[];
  completed: boolean;
}

export interface ModuleContent {
  id: string;
  moduleId: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'book';
  url: string;
  description?: string;
  order: number;
  duration?: number;
  transcript?: string; // JSON string or parsed array, depending on usage
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  userScore?: number;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  dueDate?: string | Date; // API usually returns string
  submissionType: 'file' | 'text';
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: number;
  instructorFeedback?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  previewVideoUrl?: string;        // Added: for course preview
  previewDescription?: string;     // Added: preview info text
  previewDuration?: number;         // Added: preview length in minutes
  instructorId: string;
  instructorName: string;
  moduleCount: number;
  duration: number;                // Total course duration in hours
  enrolledCount: number;
  modules: Module[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;

  // NEW: Price-related fields
  price: number;                   // Price in smallest currency unit (e.g., cents: 999 = $9.99)
  currency: string;                // e.g., 'USD', 'PKR', 'EUR' — default 'USD' in code if missing
}

export interface EnrolledCourse extends Omit<Course, 'status'> {
  progress: number;                // 0 to 100
  currentModuleId?: string;
  completedModules: number;
  status: 'draft' | 'published' | 'archived';
  enrollmentStatus: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: string;

  // Enrolled version also inherits price and currency from Course
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  imageUrl: string;
  verificationCode: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
}

export interface Note {
  id: string;
  userId: string;
  contentId: string;
  text: string;
  timestamp: number | null; // For video/audio notes
  createdAt: string;
  updatedAt: string;
}