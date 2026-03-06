"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TransactionFormModal } from "./transaction-form-modal";

interface TransactionListItemProps {
  transaction: any;
  formatCurrency: (val: number) => string;
  userId: string;
}

export function TransactionListItem({ transaction, formatCurrency, userId }: TransactionListItemProps) {
  const isIncome = transaction.type === "income" || transaction.tipo === "receita"; // Handle both API responses
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  // Format date correctly based on either API response format
  let formattedDate = "";
  try {
    const dateObj = transaction.data
      ? new Date(transaction.data + "T12:00:00") // Prevent timezone shifting
      : new Date(transaction.date);

    formattedDate = format(dateObj, "dd 'de' MMM", { locale: ptBR });
  } catch {
    formattedDate = transaction.data || transaction.date || "";
  }

  const amount = Number(transaction.valor || transaction.amount || 0);
  const description = transaction.descricao || transaction.description || "";
  const category = transaction.categoria || transaction.category || "";

  return (
    <TransactionFormModal mode="edit" initialData={transaction} userId={userId}>
      <div className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:bg-accent/50 transition-colors cursor-pointer group">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-full flex items-center justify-center shrink-0",
            isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {description}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{category}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className={cn(
            "font-semibold text-sm sm:text-base",
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
          )}>
            {isIncome ? "+" : "-"} {formatCurrency(amount)}
          </span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Editar
          </span>
        </div>
      </div>
    </TransactionFormModal>
  );
}
