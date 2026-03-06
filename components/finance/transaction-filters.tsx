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
    <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <Label>
            Mês {!filters.month && <span className="text-muted-foreground font-normal">(Todos)</span>}
          </Label>
          <Input
            type="month"
            value={filters.month || ''}
            onChange={(e) => onFilterChange('month', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={filters.type || 'all'} onValueChange={(value) => onFilterChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select disabled={!filters.type} value={filters.category || 'all'} onValueChange={(value) => onFilterChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!filters.type && (
            <p className="text-[10px] text-muted-foreground">Selecione um tipo primeiro</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select value={filters.responsible || 'all'} onValueChange={(value) => onFilterChange('responsible', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {activeResponsiblePersons.map((resp) => (
                <SelectItem key={resp.id} value={resp.name}>
                  {resp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
