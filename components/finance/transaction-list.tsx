"use client";

import { EmptyState } from '@/components/empty-state';
import { ReceiptText, Trash2, Pencil } from 'lucide-react';
import { TransactionListItem } from './transaction-list-item';
import { transactions } from '@/server/database/schemas/finance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionFormModal } from './transaction-form-modal';

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

  const formatDate = (dateString: Date | string) => {
    try {
      // Handle both formats
      const d = new Date(dateString + (typeof dateString === 'string' && !dateString.includes('T') ? "T12:00:00" : ""));
      return d.toLocaleDateString('pt-BR');
    } catch {
      return String(dateString);
    }
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
    <div className="pb-8">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="relative group/wrapper flex items-center gap-2">
             <div className="flex-1 min-w-0">
               <TransactionListItem
                  transaction={transaction}
                  formatCurrency={formatCurrency}
                  userId={userId}
                />
             </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if(confirm('Tem certeza que deseja excluir esta transação?')) {
                    onDelete(transaction.id);
                  }
                }}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-2xl transition-colors shrink-0"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto bg-card rounded-xl shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right truncate max-w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(transaction.date || (transaction as any).data)}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {transaction.description || (transaction as any).descricao}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.category || (transaction as any).categoria}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.responsible || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    (transaction.type === 'income' || (transaction as any).tipo === 'receita')
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-normal'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 font-normal'
                  }>
                    {(transaction.type === 'income' || (transaction as any).tipo === 'receita') ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="font-normal">
                    {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium whitespace-nowrap ${
                    (transaction.type === 'income' || (transaction as any).tipo === 'receita') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {(transaction.type === 'income' || (transaction as any).tipo === 'receita') ? '+' : '-'}{' '}
                  {formatCurrency(transaction.amount || (transaction as any).valor)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TransactionFormModal mode="edit" initialData={transaction} userId={userId}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TransactionFormModal>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if(confirm('Tem certeza que deseja excluir esta transação?')) {
                          onDelete(transaction.id);
                        }
                      }}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="bg-muted/30 px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{transactions.length}</span> transações
          </p>
        </div>
      </div>
    </div>
  );
}
