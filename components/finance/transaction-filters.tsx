import { useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { authClient } from '@/lib/auth/client';

interface TransactionFiltersProps {
  filters: {
    month: string;
    category: string;
    type: string;
    status: string;
    responsible: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { categoriesQuery, responsiblePersonsQuery } = useFinance(userId || "");

  const prevTypeRef = useRef(filters.type);

  useEffect(() => {
    // If type changes, clear category IF it doesn't match the new type (but simplistic check: just clear on type change if cat selected)
    if (prevTypeRef.current !== filters.type && filters.category) {
      onFilterChange('category', '');
    }
    prevTypeRef.current = filters.type;
  }, [filters.type, filters.category, onFilterChange]);

  // Filter categories based on selected type
  const activeCategories = (categoriesQuery.data || []).filter(c => {
    if (!c.isActive) return false;
    if (filters.type && filters.type !== c.type) return false;
    return true;
  });

  const activeResponsiblePersons = (responsiblePersonsQuery.data || []).filter(r => r.isActive);

  const STATUS_OPTIONS = [
    { label: 'Pago', value: 'paid' },
    { label: 'Em Aberto', value: 'pending' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mês {!filters.month && <span className="text-gray-400 font-normal">(Selecione um mês)</span>}
          </label>
          <input
            type="month"
            value={filters.month}
            onChange={(e) => onFilterChange('month', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Selecione um mês"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => {
              onFilterChange('type', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos</option>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={!filters.type}
          >
            <option value="">Todas</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {!filters.type && (
            <p className="text-xs text-gray-500 mt-1">Selecione um tipo primeiro</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select
            value={filters.responsible}
            onChange={(e) => onFilterChange('responsible', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos</option>
            {activeResponsiblePersons.map((resp) => (
              <option key={resp.id} value={resp.name}>
                {resp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}
