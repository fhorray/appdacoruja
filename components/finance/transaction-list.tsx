"use client";

import { EmptyState } from '@/components/empty-state';
import { ReceiptText, Trash2 } from 'lucide-react';
import { TransactionListItem } from './transaction-list-item';
import { transactions } from '@/server/database/schemas/finance';

type Transaction = typeof transactions.$inferSelect;

interface TransactionListProps {
  transactions: Transaction[];
  userId: string;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, userId, onDelete }: TransactionListProps) {
  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  if (transactions.length === 0) {
    return (
      <EmptyState 
        icon={ReceiptText} 
        title="Nenhuma transação encontrada" 
        description="Ajuste os filtros ou crie uma nova transação." 
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="relative group/wrapper">
           <TransactionListItem
              transaction={transaction}
              formatCurrency={formatCurrency}
              userId={userId}
            />
            {/* Delete button positioned absolute to the right of the item on hover, or accessible on swipe for mobile */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if(confirm('Tem certeza que deseja excluir esta transação?')) {
                  onDelete(transaction.id);
                }
              }}
              className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-red-500/10 text-red-600 rounded-full opacity-0 group-hover/wrapper:opacity-100 group-hover/wrapper:right-4 transition-all z-10"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
        </div>
      ))}
    </div>
  );
}
