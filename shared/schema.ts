import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  foreignKey,
  primaryKey,
  boolean,
  serial,
  uuid,
  unique,
  real,
  decimal,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { type } from "os";

// Define user roles type
export const userRoles = ['admin', 'instructor', 'learner'] as const;
export type UserRole = typeof userRoles[number];

// Define content types
export const contentTypes = ['video', 'audio', 'pdf', 'book', 'document', 'ebook'] as const;
export type ContentType = typeof contentTypes[number];

// Define library content types
export const libraryContentTypes = ['video', 'audio', 'pdf', 'book', 'document', 'ebook', 'interactive'] as const;
export type LibraryContentType = typeof libraryContentTypes[number];

// Define content protection levels
export const protectionLevels = ['basic', 'enhanced', 'maximum'] as const;
export type ProtectionLevel = typeof protectionLevels[number];

// Define quiz question types
export const questionTypes = ['multiple_choice', 'true_false', 'fill_blank'] as const;
export type QuestionType = typeof questionTypes[number];

// Define submission types
export const submissionTypes = ['file', 'text'] as const;
export type SubmissionType = typeof submissionTypes[number];

// Define enrollment status types
export const enrollmentStatuses = ['not_started', 'in_progress', 'completed'] as const;
export type EnrollmentStatus = typeof enrollmentStatuses[number];

// Define cart item types
export const cartItemTypes = ['course', 'bundle'] as const;
export type CartItemType = typeof cartItemTypes[number];

// Define supported currencies
export const supportedCurrencies = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB',
  'TRY', 'ZAR', 'KRW', 'THB', 'MYR', 'PHP', 'IDR', 'VND', 'AED', 'SAR', 'PKR'
] as const;
export type SupportedCurrency = typeof supportedCurrencies[number];

// Currency display information
export const currencyInfo: Record<SupportedCurrency, { symbol: string; name: string; decimals: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', decimals: 2 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  PLN: { symbol: 'zł', name: 'Polish Złoty', decimals: 2 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2 },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0 },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2 },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  VND: { symbol: '₫', name: 'Vietnamese Đồng', decimals: 0 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', decimals: 2 },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', decimals: 2 },
};

// Define course status types
export const courseStatuses = ['draft', 'published', 'archived'] as const;
export type CourseStatus = typeof courseStatuses[number];

// Define submission status types
export const submissionStatuses = ['not_started', 'in_progress', 'submitted', 'graded'] as const;
export type SubmissionStatus = typeof submissionStatuses[number];

// Define tour categories
export const tourCategories = ['basics', 'learning', 'advanced', 'instructor', 'admin'] as const;
export type TourCategory = typeof tourCategories[number];

// Define tour step positions
export const tourPositions = ['top', 'bottom', 'left', 'right', 'center'] as const;
export type TourPosition = typeof tourPositions[number];

// Define FAQ categories
export const faqCategories = ['general', 'enrollment', 'payments', 'certificates', 'technical'] as const;
export type FAQCategory = typeof faqCategories[number];

// Define discount types for promo codes
export const discountTypes = ['percentage', 'fixed'] as const;
export type DiscountType = typeof discountTypes[number];

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: userRoles }).default('learner').notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  dateOfBirth: varchar("date_of_birth"),
  gender: varchar("gender"),
  country: varchar("country"),
  city: varchar("city"),
  phoneNumber: varchar("phone_number"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  educationLevel: varchar("education_level"),
  fieldOfStudy: varchar("field_of_study"),
  learningGoals: text("learning_goals"),
  hearAboutUs: varchar("hear_about_us"),
  marketingEmails: boolean("marketing_emails").default(false),
  registrationDate: timestamp("registration_date"),
  emailVerified: boolean("email_verified").default(false),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  courses: many(courses),
  certificates: many(certificates),
}));

// Courses table
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url").notNull(),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  status: varchar("status", { enum: courseStatuses }).default('draft').notNull(),
  duration: integer("duration").default(0), // in hours
  price: integer("price").default(0), // course price in cents
  currency: varchar("currency").default('USD').notNull(),
  isFree: boolean("is_free").default(true).notNull(),
  tags: text("tags").array(),
  previewVideoUrl: varchar("preview_video_url"),
  previewDescription: text("preview_description"),
  previewDuration: integer("preview_duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  modules: many(modules),
  enrollments: many(enrollments),
  certificates: many(certificates),
  prerequisites: many(coursePrerequisites, { relationName: "coursePrerequisites" }),
  dependentCourses: many(coursePrerequisites, { relationName: "dependentCourses" }),
  bundleItems: many(courseBundleItems),
}));

// Course bundles table
export const courseBundles = pgTable("course_bundles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default('USD').notNull(),
  discountPercentage: integer("discount_percentage").default(0), // discount from individual course prices
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseBundlesRelations = relations(courseBundles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [courseBundles.createdById],
    references: [users.id],
  }),
  items: many(courseBundleItems),
  enrollments: many(bundleEnrollments),
}));

// Course bundle items table (junction table for bundles and courses)
export const courseBundleItems = pgTable("course_bundle_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  bundleId: uuid("bundle_id").notNull().references(() => courseBundles.id, { onDelete: 'cascade' }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseBundleItemsRelations = relations(courseBundleItems, ({ one }) => ({
  bundle: one(courseBundles, {
    fields: [courseBundleItems.bundleId],
    references: [courseBundles.id],
  }),
  course: one(courses, {
    fields: [courseBundleItems.courseId],
    references: [courses.id],
  }),
}));

// Bundle enrollments table
export const bundleEnrollments = pgTable("bundle_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bundleId: uuid("bundle_id").notNull().references(() => courseBundles.id),
  status: varchar("status", { enum: enrollmentStatuses }).default('not_started').notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // 0-100 percentage
});

export const bundleEnrollmentsRelations = relations(bundleEnrollments, ({ one }) => ({
  user: one(users, {
    fields: [bundleEnrollments.userId],
    references: [users.id],
  }),
  bundle: one(courseBundles, {
    fields: [bundleEnrollments.bundleId],
    references: [courseBundles.id],
  }),
}));

// Modules table
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  content: many(moduleContents),
  quizzes: many(quizzes),
  assignments: many(assignments),
}));

// Module content table
export const moduleContents = pgTable("module_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  type: varchar("type", { enum: contentTypes }).notNull(),
  url: varchar("url").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  duration: integer("duration"), // in minutes
  transcript: text("transcript"), // JSON string of transcript segments with timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moduleContentsRelations = relations(moduleContents, ({ one, many }) => ({
  module: one(modules, {
    fields: [moduleContents.moduleId],
    references: [modules.id],
  }),
  prerequisites: many(lessonPrerequisites, { relationName: "lessonPrerequisites" }),
  dependentLessons: many(lessonPrerequisites, { relationName: "dependentLessons" }),
}));

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70).notNull(), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, {
    fields: [quizzes.moduleId],
    references: [modules.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

// Quiz questions table
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { enum: questionTypes }).notNull(),
  options: text("options").array(),
  correctAnswer: jsonb("correct_answer").notNull(), // string or string[] depending on question type
  explanation: text("explanation"),
  points: integer("points").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

// Quiz attempts table for tracking learner quiz submissions
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer("score").notNull(), // percentage score
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").notNull(), // store all user answers with question IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

// Assignments table
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  submissionType: varchar("submission_type", { enum: submissionTypes }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  module: one(modules, {
    fields: [assignments.moduleId],
    references: [modules.id],
  }),
  submissions: many(submissions),
}));

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  status: varchar("status", { enum: enrollmentStatuses }).default('not_started').notNull(),
  progress: integer("progress").default(0).notNull(), // percentage
  currentModuleId: uuid("current_module_id").references(() => modules.id),
  completedModules: integer("completed_modules").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userCourseUnique: unique().on(table.userId, table.courseId),
  };
});

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  currentModule: one(modules, {
    fields: [enrollments.currentModuleId],
    references: [modules.id],
  }),
}));

// Submissions table
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignmentId: uuid("assignment_id").notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  content: text("content"),
  fileUrl: varchar("file_url"),
  status: varchar("status", { enum: submissionStatuses }).default('not_started').notNull(),
  grade: integer("grade"), // percentage
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userAssignmentUnique: unique().on(table.userId, table.assignmentId),
  };
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
}));

// Certificate types
export const certificateTypes = ['session_completion', 'course_completion'] as const;
export type CertificateType = typeof certificateTypes[number];

// Certificates table
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: 'cascade' }),
  bundleId: uuid("bundle_id").references(() => courseBundles.id, { onDelete: 'cascade' }),
  moduleContentId: uuid("module_content_id").references(() => moduleContents.id, { onDelete: 'cascade' }),
  type: varchar("type", { enum: certificateTypes }).notNull(),
  certificateNumber: varchar("certificate_number").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  completionDate: timestamp("completion_date").notNull(),
  totalDuration: integer("total_duration"), // in minutes
  totalSessions: integer("total_sessions"),
  instructorName: varchar("instructor_name").notNull(),
  completedModules: text("completed_modules"), // JSON array of module names
  pdfUrl: varchar("pdf_url"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  verificationCode: varchar("verification_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
  bundle: one(courseBundles, {
    fields: [certificates.bundleId],
    references: [courseBundles.id],
  }),
  moduleContent: one(moduleContents, {
    fields: [certificates.moduleContentId],
    references: [moduleContents.id],
  }),
}));

// User progress table for tracking completion of content, quizzes, and modules
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: uuid("item_id").notNull(), // Can be moduleId, contentId, or quizId
  itemType: varchar("item_type").notNull(), // 'module', 'content', 'quiz'
  data: jsonb("data"), // For storing quiz scores, etc.
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => {
  return {
    userItemUnique: unique().on(table.userId, table.itemId, table.itemType),
  };
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

// Notes table for users to take notes while learning
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: uuid("content_id").notNull().references(() => moduleContents.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  timestamp: integer("timestamp"), // For video/audio notes (in seconds)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  content: one(moduleContents, {
    fields: [notes.contentId],
    references: [moduleContents.id],
  }),
}));

// Q&A System Tables
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: 'cascade' }),
  contentId: uuid("content_id").references(() => moduleContents.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isResolved: boolean("is_resolved").default(false),
  isPrivate: boolean("is_private").default(false),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  course: one(courses, { fields: [questions.courseId], references: [courses.id] }),
  module: one(modules, { fields: [questions.moduleId], references: [modules.id] }),
  moduleContent: one(moduleContents, { fields: [questions.contentId], references: [moduleContents.id] }),
  user: one(users, { fields: [questions.userId], references: [users.id] }),
  answers: many(answers),
}));

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isInstructorAnswer: boolean("is_instructor_answer").default(false),
  isBestAnswer: boolean("is_best_answer").default(false),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
  user: one(users, { fields: [answers.userId], references: [users.id] }),
}));

// Micro-feedback for lesson engagement tracking
export const lessonFeedback = pgTable("lesson_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: uuid("content_id").notNull().references(() => moduleContents.id, { onDelete: 'cascade' }),
  feedbackType: varchar("feedback_type").notNull(), // 'helpful', 'confusing', 'love', 'too_fast', 'too_slow', 'perfect_pace'
  timestamp: real("timestamp"), // For video/audio content (in seconds)
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessonFeedbackRelations = relations(lessonFeedback, ({ one }) => ({
  user: one(users, { fields: [lessonFeedback.userId], references: [users.id] }),
  moduleContent: one(moduleContents, { fields: [lessonFeedback.contentId], references: [moduleContents.id] }),
}));



// Bundle Courses (many-to-many relationship) - Renaming to match new schema
export const bundleCourses = pgTable("bundle_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  bundleId: uuid("bundle_id").notNull().references(() => courseBundles.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bundleCoursesRelations = relations(bundleCourses, ({ one }) => ({
  bundle: one(courseBundles, {
    fields: [bundleCourses.bundleId],
    references: [courseBundles.id],
  }),
  course: one(courses, {
    fields: [bundleCourses.courseId],
    references: [courses.id],
  }),
}));

// Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // "percentage" or "fixed"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  applicableType: varchar("applicable_type", { length: 20 }).notNull(), // "course", "bundle", "all"
  applicableIds: text("applicable_ids").array(), // course or bundle IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  orders: many(orders),
}));

// Orders/Payments
export const orderStatuses = ['pending', 'completed', 'failed', 'refunded'] as const;
export type OrderStatus = typeof orderStatuses[number];

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderType: varchar("order_type", { length: 20 }).notNull(), // "course" or "bundle"
  courseId: uuid("course_id").references(() => courses.id),
  bundleId: uuid("bundle_id").references(() => courseBundles.id),
  promoCodeId: uuid("promo_code_id").references(() => promoCodes.id),
  originalPrice: decimal("original_price", { precision: 15, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default("0"),
  finalPrice: decimal("final_price", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [orders.courseId],
    references: [courses.id],
  }),
  bundle: one(courseBundles, {
    fields: [orders.bundleId],
    references: [courseBundles.id],
  }),
  promoCode: one(promoCodes, {
    fields: [orders.promoCodeId],
    references: [promoCodes.id],
  }),
}));

// Personal Notebook Table
export const personalNotes = pgTable("personal_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const personalNotesRelations = relations(personalNotes, ({ one }) => ({
  user: one(users, {
    fields: [personalNotes.userId],
    references: [users.id],
  }),
}));

// Student Activity Tracking
export const studentSessions = pgTable("student_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  loginTime: timestamp("login_time").defaultNow(),
  lastActiveTime: timestamp("last_active_time").defaultNow(),
  sessionDuration: integer("session_duration").default(0), // in minutes
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentSessionsRelations = relations(studentSessions, ({ one }) => ({
  user: one(users, {
    fields: [studentSessions.userId],
    references: [users.id],
  }),
}));

// Content Activity Tracking
export const contentActivity = pgTable("content_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: 'cascade' }),
  contentId: uuid("content_id").references(() => moduleContents.id, { onDelete: 'cascade' }),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'video_view', 'lesson_read', 'quiz_attempt', 'assignment_view'
  timeSpent: integer("time_spent").default(0), // in seconds
  progressPercentage: integer("progress_percentage").default(0),
  isCompleted: boolean("is_completed").default(false),
  metadata: jsonb("metadata"), // Additional data like video position, quiz score, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentActivityRelations = relations(contentActivity, ({ one }) => ({
  user: one(users, {
    fields: [contentActivity.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [contentActivity.courseId],
    references: [courses.id],
  }),
  module: one(modules, {
    fields: [contentActivity.moduleId],
    references: [modules.id],
  }),
  content: one(moduleContents, {
    fields: [contentActivity.contentId],
    references: [moduleContents.id],
  }),
}));

// Quiz Performance Tracking
export const quizPerformance = pgTable("quiz_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  attemptNumber: integer("attempt_number").default(1),
  score: decimal("score", { precision: 5, scale: 2 }).default("0"),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).default("0"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  timeSpent: integer("time_spent").default(0), // in seconds
  isPassed: boolean("is_passed").default(false),
  answers: jsonb("answers"), // User's answers
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizPerformanceRelations = relations(quizPerformance, ({ one }) => ({
  user: one(users, {
    fields: [quizPerformance.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizPerformance.quizId],
    references: [quizzes.id],
  }),
  course: one(courses, {
    fields: [quizPerformance.courseId],
    references: [courses.id],
  }),
}));

// Course Prerequisites (many-to-many relationship)
export const coursePrerequisites = pgTable("course_prerequisites", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  prerequisiteCourseId: uuid("prerequisite_course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    coursePrerequisiteUnique: unique().on(table.courseId, table.prerequisiteCourseId),
  };
});

export const coursePrerequisitesRelations = relations(coursePrerequisites, ({ one }) => ({
  course: one(courses, {
    fields: [coursePrerequisites.courseId],
    references: [courses.id],
  }),
  prerequisiteCourse: one(courses, {
    fields: [coursePrerequisites.prerequisiteCourseId],
    references: [courses.id],
  }),
}));

// Lesson Prerequisites (many-to-many relationship for module contents)
export const lessonPrerequisites = pgTable("lesson_prerequisites", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => moduleContents.id, { onDelete: "cascade" }),
  prerequisiteLessonId: uuid("prerequisite_lesson_id").notNull().references(() => moduleContents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    lessonPrerequisiteUnique: unique().on(table.lessonId, table.prerequisiteLessonId),
  };
});

// Lesson Progress for audio/video lessons
export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => moduleContents.id, { onDelete: "cascade" }),
  lastPosition: real("last_position").default(0), // in seconds
  completed: boolean("completed").default(false),
  watchTime: real("watch_time").default(0), // total time spent in seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userLessonUnique: unique().on(table.userId, table.lessonId),
  };
});

// Audio/Video lesson notes with timestamps
export const lessonNotes = pgTable("lesson_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => moduleContents.id, { onDelete: "cascade" }),
  timestamp: real("timestamp").notNull(), // timestamp in seconds
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonPrerequisitesRelations = relations(lessonPrerequisites, ({ one }) => ({
  lesson: one(moduleContents, {
    fields: [lessonPrerequisites.lessonId],
    references: [moduleContents.id],
  }),
  prerequisiteLesson: one(moduleContents, {
    fields: [lessonPrerequisites.prerequisiteLessonId],
    references: [moduleContents.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(moduleContents, {
    fields: [lessonProgress.lessonId],
    references: [moduleContents.id],
  }),
}));

export const lessonNotesRelations = relations(lessonNotes, ({ one }) => ({
  user: one(users, {
    fields: [lessonNotes.userId],
    references: [users.id],
  }),
  lesson: one(moduleContents, {
    fields: [lessonNotes.lessonId],
    references: [moduleContents.id],
  }),
}));

// Cart Tables
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userCartUnique: unique().on(table.userId),
  };
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  itemType: varchar("item_type").notNull().$type<CartItemType>(),
  itemId: uuid("item_id").notNull(), // course ID or bundle ID
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => {
  return {
    cartItemUnique: unique().on(table.cartId, table.itemType, table.itemId),
  };
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  course: one(courses, {
    fields: [cartItems.itemId],
    references: [courses.id],
  }),
}));

// Tour Management Tables
export const tourSections = pgTable("tour_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull().default("BookOpen"),
  category: varchar("category").notNull().$type<TourCategory>().default("basics"),
  duration: varchar("duration").notNull(),
  isNew: boolean("is_new").default(false),
  isActive: boolean("is_active").default(true),
  order: integer("order").notNull().default(0),
  videoUrl: varchar("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourSteps = pgTable("tour_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id").notNull().references(() => tourSections.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  targetElement: varchar("target_element"),
  position: varchar("position").notNull().$type<TourPosition>().default("center"),
  actionLabel: varchar("action_label"),
  actionHref: varchar("action_href"),
  tips: text("tips").array(),
  demo: boolean("demo").default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourFAQs = pgTable("tour_faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category").notNull().$type<FAQCategory>().default("general"),
  isActive: boolean("is_active").default(true),
  order: integer("order").notNull().default(0),
  relatedTourId: uuid("related_tour_id").references(() => tourSections.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourSettings = pgTable("tour_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  autoStartForNewUsers: boolean("auto_start_for_new_users").default(false),
  showProgressIndicator: boolean("show_progress_indicator").default(true),
  enableCompletionCertificates: boolean("enable_completion_certificates").default(true),
  showVideoPreviews: boolean("show_video_previews").default(true),
  enableFAQSearch: boolean("enable_faq_search").default(true),
  showCompletionBadges: boolean("show_completion_badges").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Library Content Management Tables
export const libraryContent = pgTable("library_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull().$type<LibraryContentType>(),
  fileUrl: varchar("file_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // in seconds for audio/video
  pageCount: integer("page_count"), // for books/PDFs
  author: varchar("author"),
  category: varchar("category").notNull(),
  tags: text("tags").array(),
  protectionLevel: varchar("protection_level").notNull().$type<ProtectionLevel>().default("enhanced"),
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const libraryContentAccess = pgTable("library_content_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentId: uuid("content_id").notNull().references(() => libraryContent.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  grantedBy: varchar("granted_by").notNull().references(() => users.id),
  accessLevel: varchar("access_level").notNull().default("view"), // view, download, full
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  lastAccessed: timestamp("last_accessed"),
  accessCount: integer("access_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.contentId, table.userId)
]);

export const libraryContentViews = pgTable("library_content_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentId: uuid("content_id").notNull().references(() => libraryContent.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull(),
  viewDuration: integer("view_duration"), // in seconds
  completionPercentage: real("completion_percentage").default(0),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const libraryCategories = pgTable("library_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
  color: varchar("color").default("#3B82F6"),
  icon: varchar("icon").default("Folder"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Settings for admin-configurable payment accounts
export const paymentSettings = pgTable("payment_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'easypaisa', 'jazzcash', 'bank_transfer', 'stripe'
  isEnabled: boolean("is_enabled").default(true),
  
  // Mobile wallet details (EasyPaisa, JazzCash)
  accountNumber: varchar("account_number", { length: 20 }),
  accountName: varchar("account_name", { length: 100 }),
  
  // Bank details
  bankName: varchar("bank_name", { length: 100 }),
  accountTitle: varchar("account_title", { length: 100 }),
  iban: varchar("iban", { length: 30 }),
  branchCode: varchar("branch_code", { length: 10 }),
  
  // API credentials (encrypted)
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  merchantId: varchar("merchant_id", { length: 50 }),
  
  // Additional configuration
  instructions: text("instructions"), // Payment instructions for users
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  processingFee: decimal("processing_fee", { precision: 5, scale: 2 }).default("0"), // percentage
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Transactions
export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'easypaisa', 'jazzcash', 'bank_transfer', 'stripe'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal('original_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  promoCode: text('promo_code'),
  transactionId: text('transaction_id'), // External transaction ID
  paymentReference: text('payment_reference'), // User provided reference
  paymentProofUrl: text('payment_proof_url'), // Uploaded proof file URL
  status: text('status', { enum: ['pending', 'completed', 'failed', 'cancelled'] }).default('pending'),
  verificationStatus: text('verification_status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  verifiedBy: varchar('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  paymentDate: timestamp('payment_date'),
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  receiptNumber: text('receipt_number').unique(),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment Receipts
export const paymentReceipts = pgTable('payment_receipts', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id).notNull(),
  receiptNumber: text('receipt_number').unique().notNull(),
  receiptData: jsonb('receipt_data'), // JSON data for receipt
  pdfUrl: text('pdf_url'),
  emailSent: boolean('email_sent').default(false),
  emailSentAt: timestamp('email_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment Refunds
export const paymentRefunds = pgTable('payment_refunds', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id).notNull(),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'processed'] }).default('pending'),
  processedBy: varchar('processed_by').references(() => users.id),
  processedAt: timestamp('processed_at'),
  refundReference: text('refund_reference'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment History for comprehensive tracking
export const paymentHistory = pgTable('payment_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id).notNull(),
  action: text('action').notNull(), // 'created', 'verified', 'rejected', 'refund_requested', 'refunded'
  performedBy: varchar('performed_by').references(() => users.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status'),
  notes: text('notes'),
  metadata: jsonb('metadata'), // Additional data for the action
  createdAt: timestamp('created_at').defaultNow()
});

// Invoice Management
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id).notNull(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  invoiceDate: timestamp('invoice_date').defaultNow(),
  dueDate: timestamp('due_date'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).default('draft'),
  pdfUrl: text('pdf_url'),
  emailSent: boolean('email_sent').default(false),
  emailSentAt: timestamp('email_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment Analytics
export const paymentAnalytics = pgTable('payment_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date').notNull(),
  totalTransactions: integer('total_transactions').default(0),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0'),
  successfulTransactions: integer('successful_transactions').default(0),
  failedTransactions: integer('failed_transactions').default(0),
  pendingTransactions: integer('pending_transactions').default(0),
  totalRefunds: decimal('total_refunds', { precision: 12, scale: 2 }).default('0'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment Relations
export const paymentTransactionsRelations = relations(paymentTransactions, ({ one, many }) => ({
  user: one(users, { fields: [paymentTransactions.userId], references: [users.id] }),
  course: one(courses, { fields: [paymentTransactions.courseId], references: [courses.id] }),
  verifier: one(users, { fields: [paymentTransactions.verifiedBy], references: [users.id] }),
  receipt: one(paymentReceipts, { fields: [paymentTransactions.id], references: [paymentReceipts.transactionId] }),
  refunds: many(paymentRefunds),
  history: many(paymentHistory),
  invoice: one(invoices, { fields: [paymentTransactions.id], references: [invoices.transactionId] })
}));

export const paymentReceiptsRelations = relations(paymentReceipts, ({ one }) => ({
  transaction: one(paymentTransactions, { fields: [paymentReceipts.transactionId], references: [paymentTransactions.id] })
}));

export const paymentRefundsRelations = relations(paymentRefunds, ({ one }) => ({
  transaction: one(paymentTransactions, { fields: [paymentRefunds.transactionId], references: [paymentTransactions.id] }),
  processor: one(users, { fields: [paymentRefunds.processedBy], references: [users.id] })
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  transaction: one(paymentTransactions, { fields: [paymentHistory.transactionId], references: [paymentTransactions.id] }),
  performer: one(users, { fields: [paymentHistory.performedBy], references: [users.id] })
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  transaction: one(paymentTransactions, { fields: [invoices.transactionId], references: [paymentTransactions.id] })
}));

// Tour Management Relations
export const tourSectionsRelations = relations(tourSections, ({ many }) => ({
  steps: many(tourSteps),
  faqs: many(tourFAQs),
}));

export const tourStepsRelations = relations(tourSteps, ({ one }) => ({
  section: one(tourSections, {
    fields: [tourSteps.sectionId],
    references: [tourSections.id],
  }),
}));

export const tourFAQsRelations = relations(tourFAQs, ({ one }) => ({
  relatedTour: one(tourSections, {
    fields: [tourFAQs.relatedTourId],
    references: [tourSections.id],
  }),
}));

// Zod schemas for validation
export const userSchema = createInsertSchema(users);
export const courseSchema = createInsertSchema(courses);
export const moduleSchema = createInsertSchema(modules);
export const moduleContentSchema = createInsertSchema(moduleContents);
export const quizSchema = createInsertSchema(quizzes);
export const quizQuestionSchema = createInsertSchema(quizQuestions);
export const assignmentSchema = createInsertSchema(assignments);
export const enrollmentSchema = createInsertSchema(enrollments);
export const submissionSchema = createInsertSchema(submissions);
export const certificateSchema = createInsertSchema(certificates);
export const userProgressSchema = createInsertSchema(userProgress);
export const noteSchema = createInsertSchema(notes);
export const questionSchema = createInsertSchema(questions);
export const answerSchema = createInsertSchema(answers);
export const lessonFeedbackSchema = createInsertSchema(lessonFeedback);
export const courseBundleSchema = createInsertSchema(courseBundles);
export const bundleCourseSchema = createInsertSchema(bundleCourses);
export const promoCodeSchema = createInsertSchema(promoCodes);
export const orderSchema = createInsertSchema(orders);
export const personalNoteSchema = createInsertSchema(personalNotes);
export const studentSessionSchema = createInsertSchema(studentSessions);
export const contentActivitySchema = createInsertSchema(contentActivity);
export const quizPerformanceSchema = createInsertSchema(quizPerformance);
export const coursePrerequisiteSchema = createInsertSchema(coursePrerequisites);
export const lessonPrerequisiteSchema = createInsertSchema(lessonPrerequisites);
export const lessonProgressSchema = createInsertSchema(lessonProgress);
export const lessonNotesSchema = createInsertSchema(lessonNotes);
export const quizAttemptSchema = createInsertSchema(quizAttempts);

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type ModuleContent = typeof moduleContents.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type LessonFeedback = typeof lessonFeedback.$inferSelect;
export type CourseBundle = typeof courseBundles.$inferSelect;
export type CourseBundleItem = typeof courseBundleItems.$inferSelect;
export type BundleEnrollment = typeof bundleEnrollments.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PersonalNote = typeof personalNotes.$inferSelect;
export type CoursePrerequisite = typeof coursePrerequisites.$inferSelect;
export type LessonPrerequisite = typeof lessonPrerequisites.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type LessonNote = typeof lessonNotes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type TourSection = typeof tourSections.$inferSelect;
export type TourStep = typeof tourSteps.$inferSelect;
export type TourFAQ = typeof tourFAQs.$inferSelect;
export type TourSettings = typeof tourSettings.$inferSelect;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type LibraryContent = typeof libraryContent.$inferSelect;
export type LibraryContentAccess = typeof libraryContentAccess.$inferSelect;
export type LibraryContentView = typeof libraryContentViews.$inferSelect;
export type LibraryCategory = typeof libraryCategories.$inferSelect;

// Tour Management Schemas
export const tourSectionSchema = createInsertSchema(tourSections);
export const tourStepSchema = createInsertSchema(tourSteps);
export const tourFAQSchema = createInsertSchema(tourFAQs);
export const tourSettingsSchema = createInsertSchema(tourSettings);
export const paymentSettingsSchema = createInsertSchema(paymentSettings);
export const libraryContentSchema = createInsertSchema(libraryContent);
export const libraryContentAccessSchema = createInsertSchema(libraryContentAccess);
export const libraryContentViewSchema = createInsertSchema(libraryContentViews);
export const libraryCategorySchema = createInsertSchema(libraryCategories);

// Extended types for API responses
export interface CourseDto extends Omit<Course, 'status'> {
  instructorName: string;
  moduleCount: number;
  enrolledCount: number;
  modules: ModuleWithContents[];
  status?: EnrollmentStatus;
  progress?: number;
  currentModuleId?: string | null;
  completedModules?: number;
  enrolledAt?: string;
}

export interface ModuleWithContents extends Module {
  content: ModuleContent[];
  quizzes: QuizWithQuestions[];
  assignments: Assignment[];
  completed: boolean;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
  completed: boolean;
  userScore?: number;
}

// Bundle DTO with courses
export interface BundleDto extends CourseBundle {
  courses: CourseDto[];
  courseCount: number;
  totalDuration: number;
  originalPrice: number;
  discountedPrice: number;
}

// Order DTO with related data
export interface OrderDto extends Order {
  courseName?: string;
  bundleName?: string;
  promoCodeName?: string;
}

// Additional insert types
export type PersonalNoteInsert = typeof personalNotes.$inferInsert;
export type LibraryContentInsert = typeof libraryContent.$inferInsert;
export type LibraryCategoryInsert = typeof libraryCategories.$inferInsert;
export type LibraryContentAccessInsert = typeof libraryContentAccess.$inferInsert;
export type LibraryContentViewInsert = typeof libraryContentViews.$inferInsert;
export type TourSectionInsert = typeof tourSections.$inferInsert;
export type TourFAQInsert = typeof tourFAQs.$inferInsert;
export type TourSettingsInsert = typeof tourSettings.$inferInsert;

// Student Monitoring types
export interface StudentMonitoringDto {
  userId: string;
  userName: string;
  email: string;
  role: string;
  enrolledCourses: number;
  activitySummary: ActivitySummaryDto;
  recentSessions: StudentSession[];
}

export interface ActivitySummaryDto {
  totalStudyTime: number;
  completedModules: number;
  averageScore: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface CourseProgressDto {
  courseId: string;
  courseTitle: string;
  progress: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  lastAccessedAt?: string;
  currentModuleId?: string;
  completedModules: number;
  totalModules: number;
}

// Student Monitoring DTOs
export interface StudentMonitoringDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  enrolledCourses: number;
  completedCourses: number;
  overallProgress: number;
  lastLogin: string | null;
  lastActive: string | null;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  status: 'active' | 'inactive' | 'at_risk';
  engagementLevel: 'high' | 'medium' | 'low';
}

export interface CourseProgressDto {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  timeSpent: number; // in minutes
  lastAccessed: string | null;
  quizScores: number[];
  averageQuizScore: number;
  completedModules: number;
  totalModules: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface ActivitySummaryDto {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  atRiskStudents: number;
  averageProgress: number;
  averageTimeSpent: number;
  topPerformers: StudentMonitoringDto[];
  strugglingStudents: StudentMonitoringDto[];
}

// Cart Schema and DTOs
export const insertCartSchema = createInsertSchema(carts);
export const insertCartItemSchema = createInsertSchema(cartItems);

export type InsertCart = z.infer<typeof insertCartSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type SelectCart = typeof carts.$inferSelect;
export type SelectCartItem = typeof cartItems.$inferSelect;

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CartItemDto {
  id: string;
  itemType: CartItemType;
  itemId: string;
  quantity: number;
  addedAt: Date | null;
  course?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    instructorName: string;
  };
  bundle?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    courseCount: number;
  };
}
