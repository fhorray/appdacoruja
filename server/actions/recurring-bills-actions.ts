"use server"

import { db as getDb } from "@/server/database/client";
import { recurringBills } from "@/server/database/schemas/recurring-bills";
import { getAuthSession } from "@/lib/auth/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get all recurring bills for the current user
 */
export async function getRecurringBillsAction() {
  const { user } = await getAuthSession();

  const db = await getDb();
  return db.select()
    .from(recurringBills)
    .where(eq(recurringBills.userId, user.id))
    .orderBy(recurringBills.dueDay);
}

/**
 * Create a new recurring bill
 */
export async function createRecurringBillAction(data: any) {
  const { user } = await getAuthSession();

  const db = await getDb();
  const result = await db.insert(recurringBills).values({
    ...data,
    userId: user.id,
  }).returning();

  revalidatePath("/bills");
  revalidatePath("/");
  return result[0];
}

/**
 * Update an existing recurring bill
 */
export async function updateRecurringBillAction(id: string, data: any) {
  const { user } = await getAuthSession();

  const db = await getDb();
  const result = await db.update(recurringBills)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(recurringBills.id, id), eq(recurringBills.userId, user.id)))
    .returning();

  revalidatePath("/bills");
  revalidatePath("/");
  return result[0];
}

/**
 * Delete a recurring bill
 */
export async function deleteRecurringBillAction(id: string) {
  const { user } = await getAuthSession();

  const db = await getDb();
  await db.delete(recurringBills)
    .where(and(eq(recurringBills.id, id), eq(recurringBills.userId, user.id)));

  revalidatePath("/bills");
  revalidatePath("/");
  return { success: true };
}
