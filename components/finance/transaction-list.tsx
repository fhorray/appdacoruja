"use client";

import { EmptyState } from '@/components/empty-state';
import { ReceiptText, Trash2, Pencil } from 'lucide-react';
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
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
