'use client';

import { useState, Suspense } from 'react';
import { Plus } from 'lucide-react';
import { TransactionFilters } from '@/components/finance/transaction-filters';
import { TransactionList } from '@/components/finance/transaction-list';
import { TransactionFormModal } from '@/components/finance/transaction-form-sheet';
import { useFinance } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useQueryState } from 'nuqs';
import { cn } from '@/lib/utils';

function TransactionsContent() {
  const { user } = useAuth();
  const userId = user?.id as string;
  const { transactionsQuery, deleteTransaction } = useFinance(userId || '');
  const transactions = transactionsQuery.data || [];

  const [month, setMonth] = useQueryState('month', { defaultValue: '' });
  const [category, setCategory] = useQueryState('category', {
    defaultValue: '',
  });
  const [type, setType] = useQueryState('type', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: '' });
  const [responsible, setResponsible] = useQueryState('responsible', {
    defaultValue: '',
  });
  const [creditCardId, setCreditCardId] = useQueryState('creditCardId', {
    defaultValue: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const applyFilters = (txs: any[]) => {
    return txs.filter((t) => {
      if (month && t.month !== month) return false;
      if (category && t.category !== category) return false;
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (responsible && t.responsible !== responsible) return false;
      return true;
    });
  };

  const filteredTransactions = applyFilters(transactions);

  const summary = {
    income: filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0),
    expense: filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0),
  };
  const netBalance = summary.income - summary.expense;

  const handleEdit = (transaction: any) => {
    // editing handled via Trigger buttons per row
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await deleteTransaction.mutateAsync(id);
    if (!confirm('Tem certeza?')) return;
    await deleteTransaction.mutateAsync(id);
  };

  const filters = { month, category, type, status, responsible, creditCardId };

  const handleFilterChange = (key: string, value: string) => {
    const emptyValue = value === 'all' ? '' : value;
    switch (key) {
      case 'month':
        setMonth(emptyValue || null);
        break;
      case 'category':
        setCategory(emptyValue || null);
        break;
      case 'type':
        setType(emptyValue || null);
        break;
      case 'status':
        setStatus(emptyValue || null);
        break;
      case 'responsible':
        setResponsible(emptyValue || null);
        break;
    }
  };

  const handleClearFilters = () => {
    setMonth(null);
    setCategory(null);
    setType(null);
    setStatus(null);
    setResponsible(null);
    setCreditCardId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader
        title="Transações"
        actions={
          <TransactionFormModal mode="create" userId={userId}>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </TransactionFormModal>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Total Entradas
          </span>
          <p className="text-xl font-bold text-emerald-700">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(summary.income)}
          </p>
        </div>
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
            Total Saídas
          </span>
          <p className="text-xl font-bold text-red-700">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(summary.expense)}
          </p>
        </div>
        <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            Saldo do Período
          </span>
          <p
            className={cn(
              'text-xl font-bold',
              netBalance >= 0 ? 'text-emerald-700' : 'text-red-700',
            )}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(netBalance)}
          </p>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <TransactionList
        transactions={filteredTransactions}
        userId={userId}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
