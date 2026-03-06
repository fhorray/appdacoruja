"use server";

import { db as getDb } from "@/server/database/client";
import { transactions, categories, responsiblePersons, categoryLimits, transactionTypeEnum } from "@/server/database/schemas/finance";
import { initAuth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SelectUser } from "../database/schemas";

/* Types for filters */
export interface TransactionFilters {
  mes?: string;
  ano?: number;
  categoria?: string;
  tipo?: string;
  status?: string;
  responsavel?: string;
}

/* Helper to get user */
async function getUser() {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }
  return session.user as SelectUser;
}

// --- Transactions ---

export async function getTransactionsAction(arg?: string | TransactionFilters) {
  const user = await getUser();

  // arg can be userId (string) from legacy call or filters object
  let filters: TransactionFilters | undefined;
  if (typeof arg === 'object') {
    filters = arg;
  }
  // If arg is string (userId), we ignore it and use session user, or we could filter by it if we were admin.
  // For now, securely use session user.

  let conditions = [eq(transactions.userId, user.id)];

  if (filters?.mes) {
    conditions.push(eq(transactions.month, filters.mes));
  }
  if (filters?.ano) {
    conditions.push(eq(transactions.year, filters.ano));
  }
  if (filters?.categoria) {
    conditions.push(eq(transactions.category, filters.categoria));
  }
  if (filters?.tipo) {
    conditions.push(eq(transactions.type, filters.tipo));
  }
  if (filters?.status) {
    conditions.push(eq(transactions.status, filters.status));
  }
  if (filters?.responsavel) {
    conditions.push(eq(transactions.responsible, filters.responsavel));
  }

  const db = await getDb();
  return db.select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date));
}

export async function createTransactionAction(data: any) {
  const user = await getUser();
  const db = await getDb();

  try {
    const [newTransaction] = await db.insert(transactions).values({
      ...data,
      userId: user.id,
      amount: String(data.amount),
    }).returning();

    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true, data: newTransaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Erro ao criar transação" };
  }
}

export async function updateTransactionAction(data: any) { // Data might be {id, ...} or just fields. use-finance passes {id, ...} or similar? 
  // use-finance.ts uses mutationFn: updateTransactionAction.
  // Check use-finance signature. It's `updateTransaction.mutateAsync({ id, ... })` probably.
  // Assuming data has id.
  const user = await getUser();
  const db = await getDb();
  const { id, ...updateData } = data;

  if (!id) throw new Error("ID required");

  try {
    const [updated] = await db.update(transactions)
      .set({
        ...updateData,
        amount: updateData.amount ? String(updateData.amount) : undefined,
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

export async function getCategoriesAction(arg?: string) { // arg was userId
  const user = await getUser();
  const db = await getDb();
  return db.select().from(categories).where(eq(categories.userId, user.id)).orderBy(categories.name);
}

export async function createCategoryAction(data: any) {
  const user = await getUser();
  const db = await getDb();
  try {
    // data might be string (name) or object {name, type...}
    // use-finance passes {name, type, userId...}
    const values = typeof data === 'string' ? { name: data, userId: user.id } : { ...data, userId: user.id };

    await db.insert(categories).values(values);
    revalidatePath("/transactions");
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Erro ao criar categoria' };
  }
}

export async function updateCategoryAction({ id, data }: { id: string, data: any }) {
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

export async function createResponsiblePersonAction(data: any) {
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

export async function getDashboardDataAction() {
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

  const db = await getDb();
  const allTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  const despesasMes = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const receitasMes = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const despesasAno = allTransactions
    .filter(t => t.year === currentYear && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const receitasAno = allTransactions
    .filter(t => t.year === currentYear && t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvestido = allTransactions
    .filter(t => t.category?.toLowerCase().includes('investimento'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categorias = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const totalDespesas = Object.values(categorias).reduce((sum, val) => sum + val, 0);

  const gastosPorCategoria = Object.entries(categorias)
    .filter(([_, total]) => total > 0)
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalDespesas > 0 ? (total / totalDespesas) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  const receitasCateg = allTransactions
    .filter(t => t.month === currentMonthStr && t.type === 'income')
    .reduce((acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const receitasPorCategoria = Object.entries(receitasCateg)
    .filter(([_, total]) => total > 0)
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: receitasMes > 0 ? (total / receitasMes) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  const meses = allTransactions
    .filter(t => t.year === currentYear && t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.month]) acc[t.month] = 0;
      acc[t.month] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const gastosPorMes = Object.entries(meses)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  const ultimasTransacoes = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      data: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      descricao: t.description,
      categoria: t.category,
      valor: Number(t.amount),
      tipo: t.type === 'income' ? 'receita' : 'despesa'
    }));

  const mesAnterior = getPreviousMonth(currentMonthStr);
  const mesSeguinte = getNextMonth(currentMonthStr);

  const calcMonthTotal = (monthStr: string, type: 'income' | 'expense') => {
    return allTransactions
      .filter(t => t.month === monthStr && t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const saldoMesAnterior = calcMonthTotal(mesAnterior, 'income') - calcMonthTotal(mesAnterior, 'expense');
  const saldoMesAtual = receitasMes - despesasMes;
  const saldoMesSeguinte = calcMonthTotal(mesSeguinte, 'income') - calcMonthTotal(mesSeguinte, 'expense');

  return {
    totalDespesasMes: despesasMes,
    totalReceitasMes: receitasMes,
    saldoMes: saldoMesAtual,
    saldoAnual: receitasAno - despesasAno,
    totalInvestido,
    gastosPorCategoria,
    receitasPorCategoria,
    gastosPorMes,
    ultimasTransacoes,
    mesAnteriorData: {
      mes: mesAnterior,
      mesNome: getMonthName(mesAnterior),
      total: saldoMesAnterior
    },
    mesAtualData: {
      mes: currentMonthStr,
      mesNome: getMonthName(currentMonthStr),
      total: saldoMesAtual
    },
    mesSeguinteData: {
      mes: mesSeguinte,
      mesNome: getMonthName(mesSeguinte),
      total: saldoMesSeguinte
    }
  };
}
