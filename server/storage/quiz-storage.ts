import { db } from '../db';
import { quizzes, quizQuestions, quizAttempts } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Quiz, QuizQuestion } from '@shared/schema';

export class QuizStorage {
  async createQuiz(quizData: any): Promise<Quiz> {
    const [quiz] = await db
      .insert(quizzes)
      .values(quizData)
      .returning();
    return quiz;
  }

  async getQuizById(quizId: string): Promise<Quiz | null> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);
    return quiz || null;
  }

  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, moduleId));
  }

  async getQuizWithQuestions(quizId: string): Promise<(Quiz & { questions: QuizQuestion[] }) | null> {
    const quiz = await this.getQuizById(quizId);
    if (!quiz) return null;

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId));

    return {
      ...quiz,
      questions
    };
  }

  async updateQuiz(quizId: string, quizData: any): Promise<Quiz> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set({ ...quizData, updatedAt: new Date() })
      .where(eq(quizzes.id, quizId))
      .returning();
    return updatedQuiz;
  }

  async updateQuizPassingScore(quizId: string, passingScore: number): Promise<Quiz> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set({ passingScore, updatedAt: new Date() })
      .where(eq(quizzes.id, quizId))
      .returning();
    return updatedQuiz;
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
  }

  async createQuizQuestion(questionData: any): Promise<QuizQuestion> {
    const [question] = await db
      .insert(quizQuestions)
      .values(questionData)
      .returning();
    return question;
  }

  async updateQuizQuestion(questionId: string, questionData: any): Promise<QuizQuestion> {
    const [updatedQuestion] = await db
      .update(quizQuestions)
      .set({ ...questionData, updatedAt: new Date() })
      .where(eq(quizQuestions.id, questionId))
      .returning();
    return updatedQuestion;
  }

  async deleteQuizQuestion(questionId: string): Promise<void> {
    await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
  }

  async createQuizAttempt(attemptData: any): Promise<any> {
    const [attempt] = await db
      .insert(quizAttempts)
      .values(attemptData)
      .returning();
    return attempt;
  }

  async getQuizAttempts(userId: string, quizId: string): Promise<any[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.quizId, quizId)
      ))
      .orderBy(desc(quizAttempts.createdAt));
  }

  async getLatestQuizAttempt(userId: string, quizId: string): Promise<any | null> {
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.quizId, quizId)
      ))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(1);
    return attempt || null;
  }
async getQuizzesWithQuestionsByModule(moduleId: string): Promise<(Quiz & { questions: QuizQuestion[] })[]> {
  try {
    // Get all quizzes for the module
    const moduleQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, moduleId));

    // Load questions for each quiz
    const fullQuizzes = await Promise.all(
      moduleQuizzes.map(async (quiz) => {
        const questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz.id));

        return {
          ...quiz,
          questions,
        } as Quiz & { questions: QuizQuestion[] };
      })
    );

    return fullQuizzes;
  } catch (error) {
    console.error("Error loading quizzes with questions:", error);
    throw error;
  }
}}
