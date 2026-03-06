"use server";

import { db } from "../database/client";
import { retirementConfigs, financialProjects } from "../database/schemas/investments";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth/server";

// --- Helper ---
async function getUser() {
  const { user } = await getAuthSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// --- Retirement Configs Actions ---

export async function getRetirementConfigAction() {
  try {
    const user = await getUser();
    const database = await db();
    const [config] = await database.select().from(retirementConfigs).where(eq(retirementConfigs.userId, user.id)).limit(1);
    return config;
  } catch (error) {
    console.error("Failed to fetch retirement config:", error);
    throw new Error("Failed to fetch retirement config");
  }
}

export async function upsertRetirementConfigAction(data: Partial<typeof retirementConfigs.$inferInsert>) {
  try {
    const user = await getUser();
    const database = await db();
    const [result] = await database
      .insert(retirementConfigs)
      .values({ ...data, userId: user.id })
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

export async function getFinancialProjectsAction() {
  try {
    const user = await getUser();
    const database = await db();
    return await database.select().from(financialProjects).where(eq(financialProjects.userId, user.id));
  } catch (error) {
    console.error("Failed to fetch financial projects:", error);
    throw new Error("Failed to fetch financial projects");
  }
}

export async function createFinancialProjectAction(data: Omit<typeof financialProjects.$inferInsert, "userId">) {
  try {
    const user = await getUser();
    const database = await db();
    const [result] = await database.insert(financialProjects).values({
        ...data,
        userId: user.id
    }).returning();
    revalidatePath("/investments");
    return result;
  } catch (error) {
    console.error("Failed to create financial project:", error);
    throw new Error("Failed to create financial project");
  }
}

export async function updateFinancialProjectAction({ id, data }: { id: string, data: Partial<typeof financialProjects.$inferInsert> }) {
  try {
    const user = await getUser();
    const database = await db();
    const [result] = await database.update(financialProjects)
        .set(data)
        .where(and(eq(financialProjects.id, id), eq(financialProjects.userId, user.id)))
        .returning();
    revalidatePath("/investments");
    return result;
  } catch (error) {
    console.error("Failed to update financial project:", error);
    throw new Error("Failed to update financial project");
  }
}

export async function deleteFinancialProjectAction(id: string) {
  try {
    const user = await getUser();
    const database = await db();
    await database.delete(financialProjects).where(and(eq(financialProjects.id, id), eq(financialProjects.userId, user.id)));
    revalidatePath("/investments");
  } catch (error) {
    console.error("Failed to delete financial project:", error);
    throw new Error("Failed to delete financial project");
  }
}
