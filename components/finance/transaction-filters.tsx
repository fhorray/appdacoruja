import { useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { authClient } from '@/lib/auth/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomSheet } from '@/components/custom-sheet';
import { Badge } from '@/components/ui/badge';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { CreditCard as CreditCardIcon, ReceiptText } from 'lucide-react';
import { InvoiceDetailSheet } from './invoice-detail-sheet';
import { useState } from 'react';

interface TransactionFiltersProps {
  filters: {
    month: string | null;
    category: string | null;
    type: string | null;
    status: string | null;
    responsible: string | null;
    creditCardId: string | null;
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
  const { creditCardsQuery } = useCreditCards();
  const isMobile = useIsMobile();

  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Helper to visually check if a filter is active
  const isActive = (val: string | null) => val !== null && val !== "";

  const activeFiltersCount = Object.values(filters).filter(isActive).length;

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

  const creditCards = creditCardsQuery.data || [];

  const FiltersContent = () => (
    <div className="px-4 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-2">
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Mês</Label>
        <Input
          type="month"
          value={filters.month || ''}
          onChange={(e) => onFilterChange('month', e.target.value)}
          className="h-10 rounded-md bg-card border-border/50 px-3"
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Tipo</Label>
        <Select value={filters.type || 'all'} onValueChange={(value) => onFilterChange('type', value)}>
          <SelectTrigger className="h-10 rounded-md bg-card border-border/50 px-3">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[130px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Categoria</Label>
        <Select disabled={!filters.type} value={filters.category || 'all'} onValueChange={(value) => onFilterChange('category', value)}>
          <SelectTrigger className="h-10 rounded-md bg-card border-border/50 px-3">
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

      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Status</Label>
        <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger className="h-10 rounded-md bg-card border-border/50 px-3">
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

      <div className="flex flex-col gap-1.5 min-w-[130px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Responsável</Label>
        <Select value={filters.responsible || 'all'} onValueChange={(value) => onFilterChange('responsible', value)}>
          <SelectTrigger className="h-10 rounded-md bg-card border-border/50 px-3">
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

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-muted-foreground sm:hidden">Cartão de Crédito</Label>
        <Select value={filters.creditCardId || 'all'} onValueChange={(value) => onFilterChange('creditCardId', value)}>
          <SelectTrigger className="h-10 rounded-md bg-card border-border/50 px-3">
            <div className="flex items-center gap-2 truncate">
              <CreditCardIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Cartão" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cartões</SelectItem>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filters.creditCardId && (
        <div className="flex items-end pb-0.5 sm:pb-0 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvoiceOpen(true)}
            className="h-10 rounded-md gap-2 border-primary/20 text-primary hover:text-primary hover:bg-primary/5 px-4"
          >
            <ReceiptText className="w-4 h-4" />
            Ver Fatura
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
          {activeFiltersCount > 0 && isMobile && (
            <Badge variant="secondary" className="rounded-full h-5 px-1.5 text-[10px] font-bold">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground h-8 hover:text-destructive flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar
          </Button>
        )}
      </div>

      {isMobile ? (
        <CustomSheet
          title="Filtrar Transações"
          description="Ajuste os filtros para encontrar transações específicas."
          content={<FiltersContent />}
        >
          <Button variant="outline" className="w-full rounded-md h-10 border-dashed border-2 flex justify-between px-4">
            <span className="text-sm font-medium">Configurar filtros</span>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </Button>
        </CustomSheet>
      ) : (
        <div className="flex flex-wrap gap-2">
          <FiltersContent />
        </div>
      )}

      {filters.creditCardId && (
        <InvoiceDetailSheet
          cardId={filters.creditCardId}
          referenceMonth={filters.month || new Date().toISOString().substring(0, 7)}
          isOpen={invoiceOpen}
          onClose={() => setInvoiceOpen(false)}
        />
      )}
    </div>
  );
}
