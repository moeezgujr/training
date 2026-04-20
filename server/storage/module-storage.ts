import { db } from "../db";
import { modules, moduleContents } from "@shared/schema";
import type { Module, ModuleContent } from "@shared/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export class ModuleStorage {
  async getModuleById(moduleId: string): Promise<Module> {
    const result = await db
      .select()
      .from(modules)
      .where(eq(modules.id, moduleId));

    if (!result[0]) {
      throw new Error("Module not found");
    }

    return result[0];
  }

  async createModule(moduleData: {
    courseId: string;
    title: string;
    description?: string;
    order?: number;
    duration?: number;
  }): Promise<Module> {
    // Get the next order number if not provided
    let order = moduleData.order;
    if (order === undefined) {
      const existingModules = await db
        .select({ order: modules.order })
        .from(modules)
        .where(eq(modules.courseId, moduleData.courseId))
        .orderBy(asc(modules.order));
      
      order = existingModules.length > 0 
        ? Math.max(...existingModules.map(m => m.order || 0)) + 1 
        : 1;
    }

    const newModule = {
      id: uuidv4(),
      ...moduleData,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(modules).values([newModule]);
    return newModule as Module;
  }

  async updateModule(moduleId: string, moduleData: Partial<Module>): Promise<Module> {
    const updateData = {
      ...moduleData,
      updatedAt: new Date(),
    };

    await db.update(modules)
      .set(updateData)
      .where(eq(modules.id, moduleId));

    const updatedModule = await db
      .select()
      .from(modules)
      .where(eq(modules.id, moduleId));

    return updatedModule[0];
  }

  async getModulesByIds(moduleIds: string[]): Promise<Module[]> {
    if (moduleIds.length === 0) return [];

    return await db
      .select()
      .from(modules)
      .where(sql`${modules.id} = ANY(ARRAY[${moduleIds.map(id => `'${id}'`).join(',')}])`);
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.order));
  }

  async deleteModule(moduleId: string): Promise<void> {
    // First delete all module contents
    await db.delete(moduleContents).where(eq(moduleContents.moduleId, moduleId));
    
    // Then delete the module
    await db.delete(modules).where(eq(modules.id, moduleId));
  }

  async reorderModules(moduleUpdates: { id: string; order: number }[]): Promise<void> {
    for (const update of moduleUpdates) {
      await db.update(modules)
        .set({ 
          order: update.order,
          updatedAt: new Date()
        })
        .where(eq(modules.id, update.id));
    }
  }

  // Module Content operations
  async createModuleContent(contentData: {
    moduleId: string;
    title: string;
    type: "video" | "audio" | "pdf" | "book" | "document" | "ebook";
    url?: string;
    duration?: number;
    order?: number;
    description?: string;
  }): Promise<ModuleContent> {
    // Get the next order number if not provided
    let order = contentData.order;
    if (order === undefined) {
      const existingContent = await db
        .select({ order: moduleContents.order })
        .from(moduleContents)
        .where(eq(moduleContents.moduleId, contentData.moduleId))
        .orderBy(asc(moduleContents.order));
      
      order = existingContent.length > 0 
        ? Math.max(...existingContent.map(c => c.order || 0)) + 1 
        : 1;
    }

    const newContent = {
      id: uuidv4(),
      ...contentData,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(moduleContents).values([newContent]);
    return newContent as ModuleContent;
  }

  async updateModuleContent(contentId: string, contentData: Partial<ModuleContent>): Promise<ModuleContent> {
    const updateData = {
      ...contentData,
      updatedAt: new Date(),
    };

    await db.update(moduleContents)
      .set(updateData)
      .where(eq(moduleContents.id, contentId));

    const updatedContent = await db
      .select()
      .from(moduleContents)
      .where(eq(moduleContents.id, contentId));

    return updatedContent[0];
  }

  async getModuleContent(moduleId: string): Promise<ModuleContent[]> {
    return await db
      .select()
      .from(moduleContents)
      .where(eq(moduleContents.moduleId, moduleId))
      .orderBy(asc(moduleContents.order));
  }

  async deleteModuleContent(contentId: string): Promise<void> {
    await db.delete(moduleContents).where(eq(moduleContents.id, contentId));
  }

  async reorderModuleContent(contentUpdates: { id: string; order: number }[]): Promise<void> {
    for (const update of contentUpdates) {
      await db.update(moduleContents)
        .set({ 
          order: update.order,
          updatedAt: new Date()
        })
        .where(eq(moduleContents.id, update.id));
    }
  }
}