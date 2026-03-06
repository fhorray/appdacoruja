import { useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { authClient } from '@/lib/auth/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TransactionFiltersProps {
  filters: {
    month: string | null;
    category: string | null;
    type: string | null;
    status: string | null;
    responsible: string | null;
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

  // Helper to visually check if a filter is active
  const isActive = (val: string | null) => val !== null && val !== "";

  const prevTypeRef = useRef(filters.type);

  useEffect(() => {
    // If type changes, clear category IF it doesn't match the new type
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
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>
        {(isActive(filters.month) || isActive(filters.type) || isActive(filters.category) || isActive(filters.status) || isActive(filters.responsible)) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground h-8"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible gap-2 hide-scrollbar">

        <div className="min-w-[140px] shrink-0">
          <Input
            type="month"
            value={filters.month || ''}
            onChange={(e) => onFilterChange('month', e.target.value)}
            className="h-9 rounded-full bg-card"
          />
        </div>

        <div className="min-w-[120px] shrink-0">
          <Select value={filters.type || 'all'} onValueChange={(value) => onFilterChange('type', value)}>
            <SelectTrigger className="h-9 rounded-full bg-card">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[130px] shrink-0">
          <Select disabled={!filters.type} value={filters.category || 'all'} onValueChange={(value) => onFilterChange('category', value)}>
            <SelectTrigger className="h-9 rounded-full bg-card">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[120px] shrink-0">
          <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-9 rounded-full bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[130px] shrink-0">
          <Select value={filters.responsible || 'all'} onValueChange={(value) => onFilterChange('responsible', value)}>
            <SelectTrigger className="h-9 rounded-full bg-card">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os resp.</SelectItem>
              {activeResponsiblePersons.map((resp) => (
                <SelectItem key={resp.id} value={resp.name}>
                  {resp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}
