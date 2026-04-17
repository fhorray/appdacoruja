"use server"

import { db as getDb } from "@/server/database/client";
import { creditCards, creditCardInvoices } from "@/server/database/schemas/credit-cards";
import { transactions } from "@/server/database/schemas/finance";
import { getAuthSession } from "@/lib/auth/server";
import { InsertCreditCard } from "@/server/database/schemas";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCreditCardsAction() {
  const { user } = await getAuthSession();

  const db = await getDb();
  return db.select()
    .from(creditCards)
    .where(eq(creditCards.userId, user.id))
    .orderBy(creditCards.name);
}

export async function createCreditCardAction(data: InsertCreditCard) {
  const { user } = await getAuthSession();

  const db = await getDb();
  const result = await db.insert(creditCards).values({
    ...data,
    userId: user.id,
    creditLimit: Number(data.creditLimit),
    closingDay: Number(data.closingDay),
    dueDay: Number(data.dueDay),
  }).returning();

  revalidatePath("/cards");
  revalidatePath("/");
  return result[0];
}

export async function updateCreditCardAction(id: string, data: Partial<InsertCreditCard>) {
  const { user } = await getAuthSession();

  const db = await getDb();
  const result = await db.update(creditCards)
    .set({
      ...data,
      creditLimit: data.creditLimit !== undefined ? Number(data.creditLimit) : undefined,
      closingDay: data.closingDay !== undefined ? Number(data.closingDay) : undefined,
      dueDay: data.dueDay !== undefined ? Number(data.dueDay) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, user.id)))
    .returning();

  revalidatePath("/cards");
  revalidatePath("/");
  return result[0];
}

export async function deleteCreditCardAction(id: string) {
  const { user } = await getAuthSession();

  const db = await getDb();
  await db.delete(creditCards)
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, user.id)));

  revalidatePath("/cards");
  revalidatePath("/");
  return { success: true };
}

// Emulação de faturas baseada em data de fechamento e transações
export async function getInvoiceDetailsAction(cardId: string, referenceMonth: string) {
    const { user } = await getAuthSession();
  
    const db = await getDb();
    
    // Check if card belongs to user
    const cardRes = await db.select().from(creditCards).where(and(eq(creditCards.id, cardId), eq(creditCards.userId, user.id)));
    if (!cardRes || cardRes.length === 0) throw new Error("Cartão não encontrado");
    const card = cardRes[0];

    // Ideally, we'd calculate exactly when transactions fall into which invoice 
    // based on closingDay. For simplicity, we just fetch transactions tied to this card
    // that have the matching YYYY-MM month label (or we could calculate exact date ranges).
    
    const [yearStr, monthStr] = referenceMonth.split('-');
    
    const invoiceTransactions = await db.select()
        .from(transactions)
        .where(
            and(
                eq(transactions.creditCardId, cardId),
                eq(transactions.month, referenceMonth)
            )
        )
        .orderBy(desc(transactions.date));

    // Check if an invoice record exists, if not we return calculated data
    const invoiceRecord = await db.select().from(creditCardInvoices)
        .where(
            and(
                eq(creditCardInvoices.creditCardId, cardId),
                eq(creditCardInvoices.referenceMonth, referenceMonth)
            )
        );

    const totalAmount = invoiceTransactions.reduce((acc, t) => acc + Number(t.amount), 0);

    return {
        card,
        invoice: invoiceRecord.length > 0 ? invoiceRecord[0] : null,
        transactions: invoiceTransactions,
        calculatedTotal: totalAmount,
        referenceMonth
    }
}

export async function payInvoiceAction(cardId: string, referenceMonth: string, amount: number) {
    const { user } = await getAuthSession();
  
    const db = await getDb();
    
    // Check existing invoice
    const existing = await db.select().from(creditCardInvoices)
        .where(
            and(
                eq(creditCardInvoices.creditCardId, cardId),
                eq(creditCardInvoices.referenceMonth, referenceMonth)
            )
        );

    if (existing.length > 0) {
        await db.update(creditCardInvoices).set({ status: 'paid', updatedAt: new Date() }).where(eq(creditCardInvoices.id, existing[0].id));
    } else {
        await db.insert(creditCardInvoices).values({
            creditCardId: cardId,
            userId: user.id,
            referenceMonth,
            totalAmount: amount,
            status: 'paid'
        });
    }

    revalidatePath("/cards");
    revalidatePath("/");
    return { success: true };
}
