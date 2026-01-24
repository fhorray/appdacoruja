"use server";

import { db } from "../database/client";
import { retirementConfigs, financialProjects } from "../database/schemas/investments";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Retirement Configs Actions ---

export async function getRetirementConfigAction(userId: string) {
  try {
    const [config] = await db.select().from(retirementConfigs).where(eq(retirementConfigs.userId, userId)).limit(1);
    return config;
  } catch (error) {
    console.error("Failed to fetch retirement config:", error);
    throw new Error("Failed to fetch retirement config");
  }
}

export async function upsertRetirementConfigAction({ userId, data }: { userId: string, data: Partial<typeof retirementConfigs.$inferInsert> }) {
  try {
    const [result] = await db
      .insert(retirementConfigs)
      .values({ ...data, userId } as any)
      .onConflictDoUpdate({
        target: retirementConfigs.userId,
        set: data
      })
      .returning();
    revalidatePath("/investments");
    return result;
  } catch (error) {
    console.error("Failed to upsert retirement config:", error);
    throw new Error("Failed to upsert retirement config");
  }
}

// --- Financial Projects Actions ---

export async function getFinancialProjectsAction(userId: string) {
  try {
    return await db.select().from(financialProjects).where(eq(financialProjects.userId, userId));
  } catch (error) {
    console.error("Failed to fetch financial projects:", error);
    throw new Error("Failed to fetch financial projects");
  }
}

export async function createFinancialProjectAction(data: typeof financialProjects.$inferInsert) {
  try {
    const [result] = await db.insert(financialProjects).values(data).returning();
    revalidatePath("/investments");
    return result;
  } catch (error) {
    console.error("Failed to create financial project:", error);
    throw new Error("Failed to create financial project");
  }
}

export async function updateFinancialProjectAction({ id, data }: { id: string, data: Partial<typeof financialProjects.$inferInsert> }) {
  try {
    const [result] = await db.update(financialProjects).set(data).where(eq(financialProjects.id, id)).returning();
    revalidatePath("/investments");
    return result;
  } catch (error) {
    console.error("Failed to update financial project:", error);
    throw new Error("Failed to update financial project");
  }
}

export async function deleteFinancialProjectAction(id: string) {
  try {
    await db.delete(financialProjects).where(eq(financialProjects.id, id));
    revalidatePath("/investments");
  } catch (error) {
    console.error("Failed to delete financial project:", error);
    throw new Error("Failed to delete financial project");
  }
}
