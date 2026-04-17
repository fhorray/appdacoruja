"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, ReceiptText, Pencil, Trash2, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { TransactionFormModal } from "./transaction-form-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomSheet } from "../custom-sheet";
import { useState } from "react";

interface TransactionListItemProps {
  transaction: any;
  formatCurrency: (val: number) => string;
  userId: string;
  className?: string;
  onDelete: (id: string) => void;
}

export function TransactionListItem({ transaction, formatCurrency, userId, className, onDelete }: TransactionListItemProps) {
  const isMobile = useIsMobile();
  const [showActions, setShowActions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isIncome = transaction.type === "income" || transaction.tipo === "receita"; // Handle both API responses
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  // Format date correctly based on either API response format
  let formattedDate = "";
  try {
    const dateObj = transaction.data
      ? new Date(transaction.data + "T12:00:00") // Prevent timezone shifting
      : new Date(transaction.date);

    formattedDate = format(dateObj, "dd 'de' MMM", { locale: ptBR });
  } catch (e) {
    formattedDate = transaction.data || transaction.date || "";
  }

  const amount = Number(transaction.amount || 0);
  const description = transaction.description || "";
  const category = transaction.category || "";

  const ItemContent = () => (
    <div className="relative group/item w-full">
      <div
        onClick={() => isMobile && setShowActions(true)}
        className={cn(
          "flex items-center justify-between p-4 bg-card border border-border/50 rounded-md hover:bg-accent/50 transition-all cursor-pointer group/content",
          className
        )}
      >
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground underline-offset-4">
              <span>{category}</span>
              {transaction.cardName && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1 text-primary/80 font-medium">
                    <CreditCard className="w-3 h-3" />
                    {transaction.cardName}
                  </span>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "flex flex-col items-end transition-all duration-300",
          !isMobile && "group-hover/item:translate-x-[-90px]"
        )}>
          <span className={cn(
            "font-semibold text-sm sm:text-base",
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
          )}>
            {isIncome ? "+" : "-"} {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {!isMobile && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div
            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer pointer-events-auto shadow-sm"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm('Tem certeza que deseja excluir esta transação?')) {
                onDelete(transaction.id);
              }
            }}
            className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors pointer-events-auto shadow-sm"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  const MobileActionsDrawer = () => (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-dashed">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-1",
          isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-lg">{description}</h4>
        <p className="text-sm text-muted-foreground">{category} • {formattedDate}</p>
        <span className={cn(
          "text-2xl font-black mt-1",
          isIncome ? "text-emerald-600" : "text-foreground"
        )}>
          {isIncome ? "+" : "-"} {formatCurrency(amount)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-14 rounded-md gap-2 font-bold text-lg"
          onClick={() => {
            setShowActions(false);
            setShowEdit(true);
          }}
        >
          <Pencil className="w-5 h-5 text-primary" />
          Editar
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-md gap-2 font-bold text-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            if (confirm('Excluir esta transação?')) {
              onDelete(transaction.id);
              setShowActions(false);
            }
          }}
        >
          <Trash2 className="w-5 h-5" />
          Excluir
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <ItemContent />
          <CustomSheet
            open={showActions}
            onOpenChange={setShowActions}
            title="Ações da Transação"
            className="px-4"
            content={<MobileActionsDrawer />}
          />
          <TransactionFormModal
            mode="edit"
            initialData={transaction}
            userId={userId}
            isOpen={showEdit}
            onClose={() => setShowEdit(false)}
          />
        </>
      ) : (
        <TransactionFormModal mode="edit" initialData={transaction} userId={userId}>
          <ItemContent />
        </TransactionFormModal>
      )}
    </>
  );
}
