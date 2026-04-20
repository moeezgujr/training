import { db } from "../db";
import { users, paymentSettings } from "@shared/schema";
import type { User, UpsertUser, UserRole } from "@shared/schema";
import { eq } from "drizzle-orm";

export class UserStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    // Check if user exists
    const existingUser = await this.getUser(user.id);
    
    if (existingUser) {
      // Update existing user (excluding role to prevent privilege escalation)
      const updateData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        updatedAt: new Date(),
      };
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
      
      return { ...existingUser, ...updateData };
    } else {
      // Create new user
      const newUser = {
        ...user,
        role: (user.role as UserRole) || "learner",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.insert(users).values(newUser);
      return newUser as User;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createExtendedUser(userData: any): Promise<User> {
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(users).values(newUser);
    return newUser as User;
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db.update(users)
      .set({ 
        role: role as UserRole,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getPaymentSettings(): Promise<any[]> {
    const result = await db.select().from(paymentSettings);
    return result;
  }

  async createInstructorAccount(instructorData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }): Promise<User> {
    const userData: UpsertUser = {
      ...instructorData,
      role: "instructor",
    };
    
    return await this.upsertUser(userData);
  }

  async createExtendedUser(userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    profileImageUrl?: string;
  }): Promise<User> {
    const extendedUserData: UpsertUser = {
      ...userData,
      role: userData.role || "learner",
    };
    
    return await this.upsertUser(extendedUserData);
  }
}