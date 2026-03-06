"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, ReceiptText, Pencil, Trash2 } from "lucide-react";
import { TransactionFormModal } from "./transaction-form-sheet";

interface TransactionListItemProps {
  transaction: any;
  formatCurrency: (val: number) => string;
  userId: string;
  className?: string;
  onDelete: (id: string) => void;
}

export function TransactionListItem({ transaction, formatCurrency, userId, className, onDelete }: TransactionListItemProps) {
  const isIncome = transaction.type === "income" || transaction.tipo === "receita"; // Handle both API responses
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  
  // Format date correctly based on either API response format
  let formattedDate = "";
  try {
    const dateObj = transaction.data 
      ? new Date(transaction.data + "T12:00:00") // Prevent timezone shifting
      : new Date(transaction.date);
      
    formattedDate = format(dateObj, "dd 'de' MMM", { locale: ptBR });
  } catch(e) {
    formattedDate = transaction.data || transaction.date || "";
  }

  const amount = Number(transaction.valor || transaction.amount || 0);
  const description = transaction.descricao || transaction.description || "";
  const category = transaction.categoria || transaction.category || "";

  return (
    <TransactionFormModal mode="edit" initialData={transaction} userId={userId}>
      <div className="relative group/item w-full">
        <div className={cn(
          "flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:bg-accent/50 transition-all cursor-pointer group/content",
          className
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-full flex items-center justify-center shrink-0",
              isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm sm:text-base text-foreground group-hover/content:text-primary transition-colors">
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
          </div>
        </div>

        {/* Action buttons appeared on hover */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/item:opacity-100 group-hover/item:right-4 transition-all duration-300 z-10 pointer-events-none">
          <div 
            className="p-2 bg-primary/10 text-primary rounded-full" 
            title="Editar"
          >
            <Pencil className="w-5 h-5" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if(confirm('Tem certeza que deseja excluir esta transação?')) {
                onDelete(transaction.id);
              }
            }}
            className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors pointer-events-auto"
            title="Excluir"
          >
            <Trash2 className="hidden" /> {/* Importing Trash2 from lucide-react in next step */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 w-5 h-5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      </div>
    </TransactionFormModal>
  );
}
