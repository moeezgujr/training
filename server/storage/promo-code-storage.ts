import { db } from "../db";
import { promoCodes, type PromoCode } from "@shared/schema";
import { eq, and, sql, lte, gte, or } from "drizzle-orm";

export class PromoCodeStorage {
  async getAllPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes).orderBy(sql`${promoCodes.createdAt} DESC`);
  }

  async getPromoCodeById(id: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.id, id)).limit(1);
    return result[0];
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
    return result[0];
  }

  async createPromoCode(promoCodeData: any): Promise<PromoCode> {
    const [promoCode] = await db.insert(promoCodes).values({
      code: promoCodeData.code,
      description: promoCodeData.description || '',
      discountType: promoCodeData.discountType,
      discountValue: String(promoCodeData.discountValue),
      maxUses: promoCodeData.maxUses || null,
      usedCount: 0,
      validFrom: promoCodeData.validFrom ? new Date(promoCodeData.validFrom) : new Date(),
      validUntil: promoCodeData.validUntil ? new Date(promoCodeData.validUntil) : null,
      isActive: promoCodeData.isActive !== false,
      applicableType: promoCodeData.applicableType || 'all',
      applicableIds: promoCodeData.applicableIds || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return promoCode;
  }

  async updatePromoCode(id: string, updateData: any): Promise<PromoCode | undefined> {
    const updateObj: any = {
      updatedAt: new Date(),
    };

    if (updateData.code !== undefined) updateObj.code = updateData.code;
    if (updateData.description !== undefined) updateObj.description = updateData.description;
    if (updateData.discountType !== undefined) updateObj.discountType = updateData.discountType;
    if (updateData.discountValue !== undefined) updateObj.discountValue = String(updateData.discountValue);
    if (updateData.maxUses !== undefined) updateObj.maxUses = updateData.maxUses;
    if (updateData.usedCount !== undefined) updateObj.usedCount = updateData.usedCount;
    if (updateData.validFrom !== undefined) updateObj.validFrom = new Date(updateData.validFrom);
    if (updateData.validUntil !== undefined) updateObj.validUntil = updateData.validUntil ? new Date(updateData.validUntil) : null;
    if (updateData.isActive !== undefined) updateObj.isActive = updateData.isActive;
    if (updateData.applicableType !== undefined) updateObj.applicableType = updateData.applicableType;
    if (updateData.applicableIds !== undefined) updateObj.applicableIds = updateData.applicableIds;

    const [updated] = await db.update(promoCodes).set(updateObj).where(eq(promoCodes.id, id)).returning();
    return updated;
  }

  async deletePromoCode(id: string): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id)).returning();
    return result.length > 0;
  }

  async validatePromoCode(code: string): Promise<any> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    if (!promoCode) {
      return null;
    }

    const now = new Date();
    
    // Check if promo code is active
    if (!promoCode.isActive) {
      return null;
    }

    // Check if promo code has started
    if (promoCode.validFrom && new Date(promoCode.validFrom) > now) {
      return null;
    }

    // Check if promo code has expired
    if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
      return null;
    }

    // Check if promo code has reached max uses
    if (promoCode.maxUses && (promoCode.usedCount || 0) >= promoCode.maxUses) {
      return null;
    }

    return {
      id: promoCode.id,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: Number(promoCode.discountValue),
      applicableType: promoCode.applicableType,
      applicableIds: promoCode.applicableIds,
    };
  }

  async incrementPromoCodeUsage(id: string): Promise<void> {
    await db.update(promoCodes)
      .set({ 
        usedCount: sql`${promoCodes.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, id));
  }

  async getPromoCodeStats(): Promise<any> {
    const allPromoCodes = await this.getAllPromoCodes();
    
    const totalPromoCodes = allPromoCodes.length;
    const activePromoCodes = allPromoCodes.filter(pc => pc.isActive).length;
    const expiredPromoCodes = allPromoCodes.filter(pc => 
      pc.validUntil && new Date(pc.validUntil) < new Date()
    ).length;
    const totalUsage = allPromoCodes.reduce((sum, pc) => sum + (pc.usedCount || 0), 0);

    return {
      totalPromoCodes,
      activePromoCodes,
      expiredPromoCodes,
      totalUsage,
    };
  }
}
