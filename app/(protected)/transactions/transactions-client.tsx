"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionFilters } from '@/components/finance/transaction-filters';
import { TransactionList } from '@/components/finance/transaction-list';
import { TransactionFormModal } from '@/components/finance/transaction-form-modal';
import { useFinance } from '@/hooks/use-finance';

interface TransactionsClientProps {
  initialTransactions: any[];
  userId: string;
}

export function TransactionsClient({ initialTransactions, userId }: TransactionsClientProps) {
  const { transactionsQuery, deleteTransaction } = useFinance(userId);
  // Default to query data if available (client navigation), else initialData (server load)
  const transactions = transactionsQuery.data || initialTransactions;

  const [filters, setFilters] = useState({
    month: '',
    category: '',
    type: '',
    status: '',
    responsible: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Client-side filtering (since we fetch all transactions for MVP optimization, 
  // or we could refetch from server on filter change via useQuery keys)
  // For now, let's assume we filter on client if data is loaded, 
  // OR we pass filters to useFinance/useQuery.
  // The useFinance hook in 'hooks/use-finance.ts' only accepted 'userId'.
  // We should ideally update useFinance to accept filters, or just filter a list here.
  // Given legacy fetched all and filtered in component, we will filter here.
  
  const applyFilters = (txs: any[]) => {
    return txs.filter(t => {
       if (filters.month && t.month !== filters.month) return false;
       if (filters.category && t.category !== filters.category) return false;
       if (filters.type && t.type !== filters.type) return false;
       if (filters.status && t.status !== filters.status) return false;
       if (filters.responsible && t.responsible !== filters.responsible) return false;
       return true;
    });
  };

  const filteredTransactions = applyFilters(transactions);

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
      if(!confirm('Tem certeza?')) return;
      await deleteTransaction.mutateAsync(id);
  };

  const handleOpenNew = () => {
      setEditingTransaction(null);
      setModalMode('create');
      setShowModal(true);
  };

  const handleFilterChange = (key: string, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
        month: '',
        category: '',
        type: '',
        status: '',
        responsible: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Transações</h2>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Loading state could be added if query is fetching */}
      
      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <TransactionFormModal
          mode={modalMode}
          initialData={editingTransaction}
          userId={userId}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            // Query invalidation handled by mutation in useFinance
          }}
        />
      )}
    </div>
  );
}
