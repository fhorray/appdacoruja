import { Pencil, Trash2 } from 'lucide-react';
import { transactions } from '@/server/database/schemas/finance';

type Transaction = typeof transactions.$inferSelect;

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descrição</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoria</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Responsável</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-600">
                  {formatDate(new Date(transaction.date))}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  {transaction.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{transaction.category}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {transaction.responsible || '-'}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {transaction.status === 'paid' ? 'Pago' : 'Em Aberto'}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}{' '}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:shadow-sm"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">{transactions.length}</span> transações
        </p>
      </div>
    </div>
  );
}
