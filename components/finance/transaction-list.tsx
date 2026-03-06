import { Pencil, Trash2, ReceiptText } from 'lucide-react';
import { transactions } from '@/server/database/schemas/finance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden divide-y">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="pr-2">
                <p className="text-sm font-semibold text-foreground">{transaction.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{formatDate(new Date(transaction.date))}</span>
                  <span className="text-xs text-border">•</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{transaction.category}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end">
                <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="mt-1 text-[10px] h-4 px-1.5 font-normal">
                  {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
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
                onClick={() => onDelete(transaction.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
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
                  {formatDate(new Date(transaction.date))}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-muted-foreground">{transaction.category}</TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.responsible || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'income' ? 'outline' : 'outline'} className={
                    transaction.type === 'income' 
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-normal'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 font-normal'
                  }>
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="font-normal">
                    {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium whitespace-nowrap ${
                    transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}{' '}
                  {formatCurrency(transaction.amount)}
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
                      onClick={() => onDelete(transaction.id)}
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
      </div>

      <div className="bg-muted/30 px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{transactions.length}</span> transações
        </p>
      </div>
    </div>
  );
}
