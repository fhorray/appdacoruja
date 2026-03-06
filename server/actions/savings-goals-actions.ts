"use server";

import { db as getDb } from "@/server/database/client";
import { savingsGoals, SelectUser } from "@/server/database/schemas";
import { getAuthSession } from "@/lib/auth/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to get user
async function getUser() {
  const { user } = await getAuthSession();
  return user;
}

export async function getSavingsGoalsAction(userId?: string) {
  try {
    const user = await getUser();
    const effectiveUserId = userId || user.id;

    const db = await getDb();
    
    // Ordered by active status (active first) and then by creation date
    const data = await db.select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, effectiveUserId))
      .orderBy(desc(savingsGoals.isActive), desc(savingsGoals.createdAt));

    return data;
  } catch (error) {
    console.error("Failed to fetch savings goals", error);
    throw new Error("Failed to fetch savings goals");
  }
}

export async function createSavingsGoalAction(data: {
  name: string;
  description?: string;
  targetAmount: number;
  initialAmount?: number;
  targetDate?: string;
  color?: string;
  icon?: string;
}) {
  try {
    const user = await getUser();
    const db = await getDb();

    const [newGoal] = await db.insert(savingsGoals).values({
      userId: user.id,
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount,
      currentAmount: data.initialAmount || 0,
      targetDate: data.targetDate,
      color: data.color,
      icon: data.icon,
      isCompleted: (data.initialAmount || 0) >= data.targetAmount,
    }).returning();

    revalidatePath("/(protected)/goals", "page");
    return newGoal;
  } catch (error) {
    console.error("Failed to create savings goal", error);
    throw new Error("Failed to create savings goal");
  }
}

export async function updateSavingsGoalAction({ id, data }: { 
  id: string, 
  data: Partial<{
    name: string;
    description: string;
    targetAmount: number;
    targetDate: string;
    color: string;
    icon: string;
    isActive: boolean;
  }> 
}) {
  try {
    const user = await getUser();
    const db = await getDb();

    // Need to verify if the goal belongs to the user
    // Also update isCompleted if targetAmount is provided
    const updateData: any = {
        ...data,
        updatedAt: sql`(unixepoch())`
    };

    if (data.targetAmount !== undefined) {
        // Find existing to check current amount and see if it's completed
        const [existing] = await db.select().from(savingsGoals).where(
            and(
                eq(savingsGoals.id, id),
                eq(savingsGoals.userId, user.id)
            )
        ).limit(1);

        if (existing) {
            updateData.isCompleted = existing.currentAmount >= data.targetAmount;
        }
    }

    const [updated] = await db.update(savingsGoals)
      .set(updateData)
      .where(
        and(
          eq(savingsGoals.id, id),
          eq(savingsGoals.userId, user.id)
        )
      )
      .returning();

    revalidatePath("/(protected)/goals", "page");
    return updated;
  } catch (error) {
    console.error("Failed to update savings goal", error);
    throw new Error("Failed to update savings goal");
  }
}

export async function deleteSavingsGoalAction(id: string) {
  try {
    const user = await getUser();
    const db = await getDb();

    await db.delete(savingsGoals)
      .where(
        and(
          eq(savingsGoals.id, id),
          eq(savingsGoals.userId, user.id)
        )
      );

    revalidatePath("/(protected)/goals", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete savings goal", error);
    // Don't throw, return graceful error for better UX
    return { success: false, error: "Falha ao deletar meta. Pode estar vinculada a outros registros." };
  }
}

export async function addOrWithdrawFromSavingsGoalAction({ id, amount, type }: { 
    id: string, 
    amount: number, // Always positive
    type: 'deposit' | 'withdraw' 
}) {
  try {
    const user = await getUser();
    const db = await getDb();

    // Get current record
    const [existing] = await db.select().from(savingsGoals).where(
        and(
            eq(savingsGoals.id, id),
            eq(savingsGoals.userId, user.id)
        )
    ).limit(1);

    if (!existing) {
        throw new Error("Goal not found");
    }

    let newAmount = existing.currentAmount;
    if (type === 'deposit') {
        newAmount += amount;
    } else {
        newAmount -= amount;
        // Optional: prevent negative balance
        if (newAmount < 0) newAmount = 0;
    }

    const isCompleted = newAmount >= existing.targetAmount;

    const [updated] = await db.update(savingsGoals)
      .set({
          currentAmount: newAmount,
          isCompleted,
          updatedAt: sql`(unixepoch())`
      })
      .where(
        and(
          eq(savingsGoals.id, id),
          eq(savingsGoals.userId, user.id)
        )
      )
      .returning();

    revalidatePath("/(protected)/goals", "page");
    return updated;
  } catch (error) {
    console.error("Failed to update goal amount", error);
    throw new Error("Failed to update goal amount");
  }
}
