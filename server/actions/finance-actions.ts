"use server";

import { db as getDb } from "@/server/database/client";
import { transactions, categories, responsiblePersons, categoryLimits, transactionTypeEnum } from "@/server/database/schemas/finance";
import { savingsGoals } from "@/server/database/schemas/savings-goals";
import { recurringBills } from "@/server/database/schemas/recurring-bills";
import { creditCards, creditCardInvoices } from "@/server/database/schemas/credit-cards";
import { initAuth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SelectUser, InsertTransaction, InsertCategory, InsertResponsiblePerson, SelectSavingsGoal } from "../database/schemas";
import { getAuthSession } from "@/lib/auth/server";

export interface DashboardData {
    totalMonthlyExpenses: number;
    totalMonthlyIncome: number;
    monthlyBalance: number;
    yearlyBalance: number;
    totalInvested: number;
    spendingByCategory: { category: string; total: number; percentage: number }[];
    incomeByCategory: { category: string; total: number; percentage: number }[];
    expensesByMonth: { month: string; total: number }[];
    performanceData: { month: string; income: number; expense: number }[];
    recentTransactions: {
        id: string;
        date: string;
        description: string;
        category: string;
        amount: number;
        type: 'income' | 'expense';
        cardName?: string | null;
    }[];
    previousMonthData: { month: string; monthName: string; total: number };
    currentMonthData: { month: string; monthName: string; total: number };
    nextMonthData: { month: string; monthName: string; total: number };
    topSavingsGoals: SelectSavingsGoal[];
    budgetAlerts: { category: string; limit: number; spent: number; percentage: number }[];
    committedAmount: number;
    upcomingBills: {
        name: string;
        amount: number;
        dueDay: number;
        type: string | null;
        color?: string | null;
    }[];
    insights: { type: 'positive' | 'warning' | 'info'; title: string; message: string }[];
    creditCardSummary: {
        totalLimit: number;
        totalUsed: number;
        cards: {
            id: string;
            name: string;
            brand: string | null;
            color: string | null;
            limit: number;
            used: number;
            dueDay: number;
            closingDay: number;
        }[];
    };
}

/* Types for filters */
export interface TransactionFilters {
  month?: string;
  year?: number;
  category?: string;
  type?: string;
  status?: string;
  responsible?: string;
  creditCardId?: string;
}

/* Helper to get user */
async function getUser() {
  const { user } = await getAuthSession();
  return user;
}

// --- Transactions ---

export async function getTransactionsAction(arg?: string | TransactionFilters) {
  const user = await getUser();

  // arg can be userId (string) from legacy call or filters object
  let filters: TransactionFilters | undefined;
  if (typeof arg === 'object') {
    filters = arg;
  }
 
  let conditions = [eq(transactions.userId, user.id)];

  if (filters?.month) {
    conditions.push(eq(transactions.month, filters.month));
  }
  if (filters?.year) {
    conditions.push(eq(transactions.year, filters.year));
  }
  if (filters?.category) {
    conditions.push(eq(transactions.category, filters.category));
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters?.status) {
    conditions.push(eq(transactions.status, filters.status));
  }
  if (filters?.responsible) {
    conditions.push(eq(transactions.responsible, filters.responsible));
  }
  if (filters?.creditCardId) {
    conditions.push(eq(transactions.creditCardId, filters.creditCardId));
  }

  const db = await getDb();
  const results = await db.select({
    transaction: transactions,
    cardName: creditCards.name,
  })
    .from(transactions)
    .leftJoin(creditCards, eq(transactions.creditCardId, creditCards.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

  return results.map(r => ({
    ...r.transaction,
    cardName: r.cardName
  }));
}

export async function createTransactionAction(data: InsertTransaction) {
  const user = await getUser();
  const db = await getDb();

  try {
    const [newTransaction] = await db.insert(transactions).values({
      ...data,
      userId: user.id,
      amount: Number(data.amount),
      year: Number(data.year),
    }).returning();

    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true, data: newTransaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Erro ao criar transação" };
  }
}

export async function updateTransactionAction(data: Partial<InsertTransaction> & { id: string }) { 
  const user = await getUser();
  const db = await getDb();
  const { id, ...updateData } = data;

  if (!id) throw new Error("ID required");

  try {
    const [updated] = await db.update(transactions)
      .set({
        ...updateData,
        amount: updateData.amount !== undefined ? Number(updateData.amount) : undefined,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning();

    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Erro ao atualizar transação" };
  }
}

export async function deleteTransactionAction(id: string) {
  const user = await getUser();
  const db = await getDb();

  try {
    await db.delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Erro ao excluir transação" };
  }
}

// --- Categories ---

export async function getCategoriesAction(arg?: string) {
  const user = await getUser();
  const db = await getDb();
  return db.select().from(categories).where(eq(categories.userId, user.id)).orderBy(categories.name);
}

export async function createCategoryAction(data: InsertCategory | string) {
  const user = await getUser();
  const db = await getDb();
  try {
    const values = typeof data === 'string' ? { name: data, userId: user.id } : { ...data, userId: user.id };

    await db.insert(categories).values(values);
    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Erro ao criar categoria' };
  }
}

export async function updateCategoryAction({ id, data }: { id: string, data: Partial<InsertCategory> }) {
  const user = await getUser();
  const db = await getDb();
  try {
    await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, user.id)));
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Erro' };
  }
}

export async function deleteCategoryAction(id: string) {
  const user = await getUser();
  const db = await getDb();
  try {
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, user.id)));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// --- Responsible Persons ---

export async function getResponsiblePersonsAction(arg?: string) {
  const user = await getUser();
  const db = await getDb();
  return db.select().from(responsiblePersons).where(eq(responsiblePersons.userId, user.id)).orderBy(responsiblePersons.name);
}

export async function createResponsiblePersonAction(data: InsertResponsiblePerson | string) {
  const user = await getUser();
  const db = await getDb();
  try {
    const values = typeof data === 'string' ? { name: data, userId: user.id } : { ...data, userId: user.id };
    await db.insert(responsiblePersons).values(values);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Erro ao criar responsável' };
  }
}

export async function updateResponsiblePersonAction({ id, data }: { id: string, data: any }) {
  const user = await getUser();
  const db = await getDb();
  try {
    await db.update(responsiblePersons).set(data).where(and(eq(responsiblePersons.id, id), eq(responsiblePersons.userId, user.id)));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function deleteResponsiblePersonAction(id: string) {
  const user = await getUser();
  const db = await getDb();
  try {
    await db.delete(responsiblePersons).where(and(eq(responsiblePersons.id, id), eq(responsiblePersons.userId, user.id)));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function clearUserDataAction() {
  const user = await getUser();
  const db = await getDb();
  
  try {
    await db.delete(transactions).where(eq(transactions.userId, user.id));
    await db.delete(categories).where(eq(categories.userId, user.id));
    await db.delete(responsiblePersons).where(eq(responsiblePersons.userId, user.id));
    await db.delete(categoryLimits).where(eq(categoryLimits.userId, user.id));
    await db.delete(savingsGoals).where(eq(savingsGoals.userId, user.id));
    await db.delete(recurringBills).where(eq(recurringBills.userId, user.id));
    await db.delete(creditCardInvoices).where(eq(creditCardInvoices.userId, user.id));
    await db.delete(creditCards).where(eq(creditCards.userId, user.id));
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear user data", error);
    return { success: false, error: "Falha ao limpar dados" };
  }
}

// --- Category Limits ---

export async function getCategoryLimitsAction(arg?: string) {
  const user = await getUser();
  const db = await getDb();
  return db.select().from(categoryLimits).where(eq(categoryLimits.userId, user.id));
}

export async function upsertCategoryLimitAction(data: any) {
  const user = await getUser();
  const db = await getDb();
  try {
    await db.insert(categoryLimits).values({ ...data, userId: user.id })
      .onConflictDoUpdate({
        target: [categoryLimits.category, categoryLimits.referenceYear],
        set: data
      });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// --- Dashboard Data ---

export async function getDashboardDataAction(): Promise<DashboardData> {
  const user = await getUser();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;


  const getMonthName = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getPreviousMonth = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    date.setMonth(date.getMonth() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const lastMonthStr = getPreviousMonth(currentMonthStr);

  const db = await getDb();
  const allTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  const userSavingsGoals = await db.select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, user.id));

  const userCategoryLimits = await db.select()
    .from(categoryLimits)
    .where(and(eq(categoryLimits.userId, user.id), eq(categoryLimits.referenceYear, currentYear)));

  const userRecurringBills = await db.select()
    .from(recurringBills)
    .where(and(eq(recurringBills.userId, user.id), eq(recurringBills.isActive, true)));

  const monthlyExpenses = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousMonthExpenses = allTransactions
    .filter(t => t.month === lastMonthStr && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // --- Enhanced Insights ---
  const insights = [];

  // 1. Comparison with previous month
  if (monthlyExpenses > 0 && previousMonthExpenses > 0) {
    const diff = ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
    if (diff > 10) {
      insights.push({
        type: 'warning' as const,
        title: 'Gasto em aumento',
        message: `Você gastou ${diff.toFixed(0)}% a mais que no mês passado até agora.`,
      });
    } else if (diff < -10) {
      insights.push({
        type: 'positive' as const,
        title: 'Economia detectada',
        message: `Parabéns! Seus gastos estão ${Math.abs(diff).toFixed(0)}% menores que no mês passado.`,
      });
    }
  }

  // 2. Spending by category vs average (Simplified)
  const categorySpending: Record<string, number> = {};
  allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'expense')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
    });

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];

  if (topCategory && topCategory[1] > (0.4 * monthlyExpenses)) {
     insights.push({
         type: 'info' as const,
         title: 'Foco em ' + topCategory[0],
         message: `${topCategory[0]} representa ${( (topCategory[1] / monthlyExpenses) * 100).toFixed(0)}% dos seus gastos este mês.`
     });
  }

  const monthlyIncome = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 3. Committed Salary Insight
  const totalCommitted = userRecurringBills.reduce((sum, b) => sum + Number(b.amount), 0);
 
  if (monthlyIncome > 0) {
      const perc = (totalCommitted / monthlyIncome) * 100;
      if (perc > 50) {
        insights.push({
            type: 'warning' as const,
            title: 'Comprometimento Alto',
            message: `Suas contas fixas ocupam ${perc.toFixed(0)}% da sua renda. Tente reduzir assinaturas.`
        });
      }
  }

  const yearlyExpenses = allTransactions
    .filter(t => t.year === currentYear && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const yearlyIncome = allTransactions
    .filter(t => t.year === currentYear && t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvested = allTransactions
    .filter(t => t.category?.toLowerCase().includes('investimento'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoriesMap = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoriesMap).reduce((sum, val) => sum + val, 0);

  const spendingByCategory = Object.entries(categoriesMap)
    .filter(([_, total]) => total > 0)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  const budgetAlerts = userCategoryLimits
    .filter(limit => limit.monthlyLimit && limit.monthlyLimit > 0)
    .map(limit => {
      const spentInfo = spendingByCategory.find(g => g.category === limit.category);
      const spent = spentInfo ? spentInfo.total : 0;
      const percentage = (spent / limit.monthlyLimit!) * 100;
      return {
        category: limit.category,
        limit: limit.monthlyLimit!,
        spent,
        percentage
      };
    })
    .filter(alert => alert.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const incomeCategoriesMap = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'income')
    .reduce((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = Object.entries(incomeCategoriesMap)
    .filter(([_, total]) => total > 0)
    .map(([category, total]) => ({
      category,
      total,
      percentage: monthlyIncome > 0 ? (total / monthlyIncome) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  const meses = allTransactions
    .filter(t => t.year === currentYear && t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.month]) acc[t.month] = 0;
      acc[t.month] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const expensesByMonth = Object.entries(meses)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      description: t.description,
      category: t.category,
      amount: Number(t.amount),
      type: (t.type === 'income' ? 'income' : 'expense') as 'income' | 'expense'
    }));

  const previousMonth = getPreviousMonth(currentMonthStr);
  const nextMonth = getNextMonth(currentMonthStr);

  const calcMonthTotal = (monthStr: string, type: 'income' | 'expense') => {
    return allTransactions
      .filter(t => t.month === monthStr && t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const previousMonthBalance = calcMonthTotal(previousMonth, 'income') - calcMonthTotal(previousMonth, 'expense');
  const currentMonthBalance = monthlyIncome - monthlyExpenses;
  const nextMonthBalance = calcMonthTotal(nextMonth, 'income') - calcMonthTotal(nextMonth, 'expense');

  // --- Credit Card Summary ---
  const userCreditCards = await db.select()
    .from(creditCards)
    .where(and(eq(creditCards.userId, user.id), eq(creditCards.isActive, true)));

  const userInvoices = await db.select()
    .from(creditCardInvoices)
    .where(and(eq(creditCardInvoices.userId, user.id), eq(creditCardInvoices.referenceMonth, currentMonthStr)));

  const creditCardSummary = {
    totalLimit: 0,
    totalUsed: 0,
    cards: [] as any[]
  };

  userCreditCards.forEach(card => {
    creditCardSummary.totalLimit += card.creditLimit;

    // Transactions for this card this month
    const cardTransactions = allTransactions.filter(t => t.creditCardId === card.id && t.month === currentMonthStr);
    const invoiceTotal = cardTransactions.reduce((acc, t) => acc + Number(t.amount), 0);

    // Existing invoice record?
    const existingInvoice = userInvoices.find(inv => inv.creditCardId === card.id);
    const finalAmount = existingInvoice ? existingInvoice.totalAmount : invoiceTotal;

    creditCardSummary.totalUsed += finalAmount;

    creditCardSummary.cards.push({
      id: card.id,
      name: card.name,
      brand: card.brand,
      color: card.color,
      limit: card.creditLimit,
      used: finalAmount,
      dueDay: card.dueDay,
      closingDay: card.closingDay
    });
  });

  // --- Yearly Performance (Last 6 months) ---
  const performanceData = [];
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = d.toLocaleDateString('pt-BR', { month: 'short' });
      
      const inc = calcMonthTotal(mLabel, 'income');
      const exp = calcMonthTotal(mLabel, 'expense');
      
      performanceData.push({ month: mName, income: inc, expense: exp });
  }

  return {
    totalMonthlyExpenses: monthlyExpenses,
    totalMonthlyIncome: monthlyIncome,
    monthlyBalance: currentMonthBalance,
    yearlyBalance: yearlyIncome - yearlyExpenses,
    totalInvested,
    spendingByCategory,
    incomeByCategory,
    expensesByMonth,
    performanceData,
    recentTransactions,
    previousMonthData: {
      month: previousMonth,
      monthName: getMonthName(previousMonth),
      total: previousMonthBalance
    },
    currentMonthData: {
      month: currentMonthStr,
      monthName: getMonthName(currentMonthStr),
      total: currentMonthBalance
    },
    nextMonthData: {
      month: nextMonth,
      monthName: getMonthName(nextMonth),
      total: nextMonthBalance
    },
    topSavingsGoals: userSavingsGoals,
    budgetAlerts,
    committedAmount: totalCommitted,
    upcomingBills: userRecurringBills
        .sort((a, b) => {
            const today = new Date().getDate();
            const aDiff = a.dueDay >= today ? a.dueDay - today : a.dueDay + 31 - today;
            const bDiff = b.dueDay >= today ? b.dueDay - today : b.dueDay + 31 - today;
            return aDiff - bDiff;
        })
        .slice(0, 3)
        .map(b => ({ ...b, type: b.type })), 
    insights,
    creditCardSummary
  };
}
