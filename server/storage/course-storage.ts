import { db } from "../db";
import { 
  courses, 
  modules, 
  moduleContents, 
  users, 
  enrollments,
  quizzes,
  lessonProgress,
  lessonNotes
} from "@shared/schema";
import type { Course, CourseDto, CourseStatus, EnrollmentStatus, LessonProgress, LessonNote } from "@shared/schema";
import { eq, and, asc, desc, or, ne, like, sql, inArray, count } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export class CourseStorage {
  async getAllCourses(): Promise<CourseDto[]> {
    try {
      console.log('Attempting to fetch courses...');
      
      // Only return published courses for public listing
      const simpleCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.status, 'published'));
      
      console.log('Found', simpleCourses.length, 'courses');

      // Transform to CourseDto format with default values for missing fields
      const courseDtos: CourseDto[] = simpleCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        instructorId: course.instructorId,
        instructorName: 'Unknown', // Will update later
        status: course.status,
        duration: course.duration,
        price: course.price,
        currency: course.currency,
        isFree: course.isFree,
        tags: course.tags || [],
        previewVideoUrl: course.previewVideoUrl,
        previewDescription: course.previewDescription,
        previewDuration: course.previewDuration,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        modules: [],
        enrollmentStatus: undefined,
        moduleCount: 0,
        enrolledCount: 0
      }));

      return courseDtos;
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      console.error('Error stack:', error.stack);
      return [];
    }
  }

  async getAllCoursesWithStats(): Promise<any[]> {
    const coursesWithStats = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        instructorId: courses.instructorId,
        status: courses.status,
        duration: courses.duration,
        price: courses.price,
        currency: courses.currency,
        isFree: courses.isFree,
        tags: courses.tags,
        previewVideoUrl: courses.previewVideoUrl,
        previewDescription: courses.previewDescription,
        previewDuration: courses.previewDuration,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        instructorName: sql<string>`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
        instructorEmail: users.email,
        moduleCount: sql<number>`COUNT(DISTINCT ${modules.id})`,
        enrolledCount: sql<number>`COUNT(DISTINCT ${enrollments.id})`,
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .leftJoin(modules, eq(courses.id, modules.courseId))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .groupBy(
        courses.id,
        courses.title,
        courses.description,
        courses.imageUrl,
        courses.instructorId,
        courses.status,
        courses.duration,
        courses.price,
        courses.currency,
        courses.isFree,
        courses.tags,
        courses.previewVideoUrl,
        courses.previewDescription,
        courses.previewDuration,
        courses.createdAt,
        courses.updatedAt,
        users.firstName,
        users.lastName,
        users.email
      );

    return coursesWithStats;
  }

  async getCourseById(courseId: string, userId?: string | null): Promise<CourseDto | null> {
    try {
      console.log('Fetching course by ID:', courseId);
      
      // First, get the course
      const courseResults = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));
      
      const course = courseResults[0];
      
      if (!course) {
        console.log('Course not found');
        return null;
      }
      
      // Get instructor details separately
      const instructor = await db
        .select()
        .from(users)
        .where(eq(users.id, course.instructorId));
      
      const instructorName = instructor[0] 
        ? `${instructor[0].firstName || ''} ${instructor[0].lastName || ''}`.trim() || instructor[0].email || 'Unknown'
        : 'Unknown';

      console.log('Found course:', course.title);

      // Get modules with content - simplified approach
      let courseModules = [];
      try {
        console.log('Fetching modules for course:', courseId);
        courseModules = await db
          .select()
          .from(modules)
          .where(eq(modules.courseId, courseId));
        console.log('Found', courseModules.length, 'modules');
      } catch (err) {
        console.error('Error fetching modules:', err);
        courseModules = [];
      }

      // Get content and quizzes for each module
      const modulesWithContent = await Promise.all(
        courseModules.map(async (module) => {
          const content = await db
            .select()
            .from(moduleContents)
            .where(eq(moduleContents.moduleId, module.id))
            .orderBy(asc(moduleContents.order));
            
          // Check completion status if userId is provided
          let contentWithStatus = content.map((c: any) => ({ ...c, completed: false }));
          
          if (userId) {
            const progress = await db
              .select({ lessonId: lessonProgress.lessonId })
              .from(lessonProgress)
              .innerJoin(moduleContents, eq(lessonProgress.lessonId, moduleContents.id))
              .where(and(
                eq(lessonProgress.userId, userId),
                eq(lessonProgress.completed, true),
                eq(moduleContents.moduleId, module.id)
              ));
            
            const completedIds = new Set(progress.map(p => p.lessonId));
            contentWithStatus = content.map((c: any) => ({ 
              ...c, 
              completed: completedIds.has(c.id) 
            }));
          }
          
          // Also fetch quizzes for this module
          const moduleQuizzes = await db
            .select()
            .from(quizzes)
            .where(eq(quizzes.moduleId, module.id));
          
          // Transform quizzes to look like content items
          const quizContent = moduleQuizzes.map((quiz: any) => ({
            ...quiz,
            type: 'quiz',
            url: `/quiz/${quiz.id}`,
            order: 999,  // Place quizzes at the end
            completed: false
          }));
          
          // Combine content and quizzes
          const allContent = [...contentWithStatus, ...quizContent];

          return {
            ...module,
            content: allContent,
            quizzes: moduleQuizzes  // Keep quizzes separate too for the quiz tab
          };
        })
      );

      // Return the complete course data
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        instructorId: course.instructorId,
        instructorName: instructorName,
        status: course.status,
        duration: course.duration,
        price: course.price,
        currency: course.currency,
        isFree: course.isFree,
        tags: course.tags || [],
        previewVideoUrl: course.previewVideoUrl,
        previewDescription: course.previewDescription,
        previewDuration: course.previewDuration,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        modules: modulesWithContent,
        enrollmentStatus: undefined,
        moduleCount: courseModules.length,
        enrolledCount: 0
      } as CourseDto;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      return null;
    }
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    imageUrl?: string;
    instructorId: string;
    price?: string;
    currency?: string;
    level?: string;
    language?: string;
    tags?: string[];
    prerequisites?: string[];
    learningOutcomes?: string[];
  }): Promise<Course> {
    const newCourse = {
      id: uuidv4(),
      ...courseData,
      status: "draft" as CourseStatus,
      duration: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(courses).values(newCourse);
    return newCourse as Course;
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    const updateData = {
      ...courseData,
      updatedAt: new Date(),
    };

    await db.update(courses)
      .set(updateData)
      .where(eq(courses.id, courseId));

    const updatedCourse = await db.select().from(courses).where(eq(courses.id, courseId));
    return updatedCourse[0];
  }

  async deleteCourse(courseId: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, courseId));
  }

  async duplicateCourse(courseId: string): Promise<Course> {
    const originalCourse = await db.select().from(courses).where(eq(courses.id, courseId));
    
    if (!originalCourse[0]) {
      throw new Error("Course not found");
    }

    const duplicatedCourse = {
      ...originalCourse[0],
      id: uuidv4(),
      title: `${originalCourse[0].title} (Copy)`,
      status: "draft" as CourseStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    

    await db.insert(courses).values(duplicatedCourse);
    return duplicatedCourse as Course;
  }

  async updateCourseStatus(courseId: string, status: string): Promise<void> {
    await db.update(courses)
      .set({ 
        status: status as CourseStatus,
        updatedAt: new Date() 
      })
      .where(eq(courses.id, courseId));
  }

  async getEnrolledCourses(userId: string): Promise<any[]> {
    console.log('🔍 getEnrolledCourses called with userId:', userId);
    
    const enrolledCourses = await db
      .select()
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    console.log('📚 Found', enrolledCourses.length, 'enrolled courses for user:', userId);

    // Transform the results to flatten the structure
    const result = enrolledCourses.map(row => ({
      id: row.courses.id,
      title: row.courses.title,
      description: row.courses.description,
      imageUrl: row.courses.imageUrl,
      instructorId: row.courses.instructorId,
      courseStatus: row.courses.status,
      duration: row.courses.duration,
      price: row.courses.price,
      currency: row.courses.currency,
      level: row.courses.level,
      language: row.courses.language,
      createdAt: row.courses.createdAt,
      updatedAt: row.courses.updatedAt,
      instructorName: 'Unknown', // Will fetch separately if needed
      enrollmentDate: row.enrollments.createdAt,
      progress: row.enrollments.progress,
      enrollmentStatus: row.enrollments.status,
    }));
    
    console.log('✅ Returning enrolled courses:', JSON.stringify(result, null, 2));
    return result;
  }

  async getRecommendedCourses(userId: string): Promise<any[]> {
    // Simple recommendation: return published courses not enrolled by user
    const enrolledCourseIds = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const excludeIds = enrolledCourseIds.map(e => e.courseId);

    let query = db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        instructorId: courses.instructorId,
        status: courses.status,
        duration: courses.duration,
        price: courses.price,
        currency: courses.currency,
        level: courses.level,
        language: courses.language,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        instructorName: sql<string>`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(eq(courses.status, "published"));

    if (excludeIds.length > 0) {
      query = query.where(sql`${courses.id} NOT IN (${excludeIds.map(id => `'${id}'`).join(',')})`);
    }

    return await query.limit(10);
  }

  async getInstructorCourses(instructorId: string): Promise<any[]> {
    return await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        instructorId: courses.instructorId,
        status: courses.status,
        duration: courses.duration,
        price: courses.price,
        currency: courses.currency,
        level: courses.level,
        language: courses.language,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        enrolledCount: sql<number>`COUNT(DISTINCT ${enrollments.id})`,
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(courses.instructorId, instructorId))
      .groupBy(courses.id);
  }

  // Lesson progress and notes operations
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const result = await db
      .select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      ))
      .limit(1);
    
    return result[0] || null;
  }

  async updateLessonProgress(userId: string, lessonId: string, data: { lastPosition: number; completed: boolean; watchTime: number }): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(userId, lessonId);
    
    if (existing) {
      const updated = await db
        .update(lessonProgress)
        .set({
          lastPosition: data.lastPosition,
          completed: data.completed,
          watchTime: data.watchTime,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existing.id))
        .returning();
      
      return updated[0];
    } else {
      const created = await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          lastPosition: data.lastPosition,
          completed: data.completed,
          watchTime: data.watchTime,
        })
        .returning();
      
      return created[0];
    }
  }

  async getLessonNotes(userId: string, lessonId: string): Promise<LessonNote[]> {
    return await db
      .select()
      .from(lessonNotes)
      .where(and(
        eq(lessonNotes.userId, userId),
        eq(lessonNotes.lessonId, lessonId)
      ))
      .orderBy(asc(lessonNotes.timestamp));
  }

  async addLessonNote(userId: string, lessonId: string, timestamp: number, content: string): Promise<LessonNote> {
    const created = await db
      .insert(lessonNotes)
      .values({
        userId,
        lessonId,
        timestamp,
        content,
      })
      .returning();
    
    return created[0];
  }

  async deleteLessonNote(userId: string, noteId: string): Promise<void> {
    await db
      .delete(lessonNotes)
      .where(and(
        eq(lessonNotes.id, noteId),
        eq(lessonNotes.userId, userId)
      ));
  }

  async markContentComplete(userId: string, contentId: string): Promise<void> {
    const existing = await this.getLessonProgress(userId, contentId);
    
    if (existing) {
      await db
        .update(lessonProgress)
        .set({
          completed: true,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existing.id));
    } else {
      await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId: contentId,
          lastPosition: 0,
          completed: true,
          watchTime: 0,
        });
    }
  }

  async getAllEnrollmentsWithDetails(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: enrollments.id,
          status: enrollments.status,
          progress: enrollments.progress,
          createdAt: enrollments.createdAt,
          // Get Student Details
          studentName: sql<string>`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
          studentEmail: users.email,
          // Get Course Details
          courseTitle: courses.title,
          courseId: courses.id
        })
        .from(enrollments)
        // JOIN on the new VARCHAR userId
        .leftJoin(users, eq(enrollments.userId, users.id))
        .leftJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.createdAt));

      return result;
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      return [];
    }
  }

  async updateCourseProgress(userId: string, courseId: string): Promise<number> {
    // 1. Get total lessons in course
    const totalLessonsResult = await db
      .select({ count: count(moduleContents.id) })
      .from(moduleContents)
      .innerJoin(modules, eq(moduleContents.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
      
    const totalLessons = Number(totalLessonsResult[0]?.count || 0);
    
    if (totalLessons === 0) return 0;

    // 2. Get completed lessons for this user in this course
    const completedLessonsResult = await db
      .select({ count: count(lessonProgress.id) })
      .from(lessonProgress)
      .innerJoin(moduleContents, eq(lessonProgress.lessonId, moduleContents.id))
      .innerJoin(modules, eq(moduleContents.moduleId, modules.id))
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.completed, true),
        eq(modules.courseId, courseId)
      ));

    const completedLessons = Number(completedLessonsResult[0]?.count || 0);
    const progress = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

    // 3. Update enrollment
    await db
      .update(enrollments)
      .set({ 
        progress,
        status: progress === 100 ? 'completed' : 'in_progress',
        updatedAt: new Date()
      })
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));

    return progress;
  }
}