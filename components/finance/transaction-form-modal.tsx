"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';

interface TransactionFormModalProps {
  children?: React.ReactNode;
  initialData?: any;
  mode: 'create' | 'edit';
  userId: string;
}

export function TransactionFormModal({ children, initialData, mode, userId }: TransactionFormModalProps) {
  return (
    <CustomSheet
      title={mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
      side="right"
      className="w-full sm:max-w-md overflow-y-auto"
      content={({ close }) => (
        <TransactionFormContent initialData={initialData} mode={mode} userId={userId} close={close} />
      )}
    >
      {children}
    </CustomSheet>
  );
}

function TransactionFormContent({ initialData, mode, userId, close }: { initialData: any, mode: 'create'|'edit', userId: string, close: () => void }) {
  const {
    categoriesQuery,
    responsiblePersonsQuery,
    createTransaction,
    updateTransaction,
    createCategory,
    createResponsiblePerson
  } = useFinance(userId);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialDate = initialData?.date || initialData?.data;
  const initialDateString = initialDate ? new Date(initialDate + "T12:00:00").toISOString().split('T')[0] : getLocalDateString();
  const initialAmount = initialData?.amount || initialData?.valor;
  const initialType = initialData?.type || initialData?.tipo || 'expense';

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    type: initialType,
    date: initialDateString,
    amount: initialAmount ? Number(initialAmount) : '',
    description: initialData?.description || initialData?.descricao || '',
    category: initialData?.category || initialData?.categoria || '',
    status: initialData?.status || 'paid',
    paymentMethod: initialData?.paymentMethod || '',
    responsible: initialData?.responsible || '',
    location: initialData?.location || '',
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewResponsavel, setShowNewResponsavel] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newResponsavelName, setNewResponsavelName] = useState('');

  const STATUS_OPTIONS = [
    { label: 'Pago', value: 'paid' },
    { label: 'Em Aberto', value: 'pending' }
  ];

  const filteredCategories = categoriesQuery.data?.filter(
    c => c.type === formData.type && c.isActive
  ) || [];

  const activeResponsiblePersons = responsiblePersonsQuery.data?.filter(
    r => r.isActive
  ) || [];

  async function handleAddCategory() {
    if (!newCategoryName.trim() || !userId) return;
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        type: formData.type as 'expense' | 'income',
        userId: userId,
        isActive: true
      });
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch {
      alert('Erro ao adicionar categoria.');
    }
  }

  async function handleAddResponsavel() {
    if (!newResponsavelName.trim() || !userId) return;
    try {
      await createResponsiblePerson.mutateAsync({
        name: newResponsavelName.trim(),
        userId: userId,
        isActive: true
      });
      setFormData({ ...formData, responsible: newResponsavelName.trim() });
      setNewResponsavelName('');
      setShowNewResponsavel(false);
    } catch {
      alert('Erro ao adicionar responsável.');
    }
  }

  async function handleSubmit() {
    if (!userId || !formData.amount || !formData.description || !formData.category) return;

    try {
      const [yearStr, monthStr] = formData.date.split('-');
      const year = parseInt(yearStr);
      const monthLabel = `${yearStr}-${monthStr}`;

      const baseTransactionData = {
        type: formData.type,
        amount: String(formData.amount),
        description: formData.description,
        category: formData.category,
        status: formData.status,
        paymentMethod: formData.paymentMethod || null,
        responsible: formData.responsible || null,
        location: formData.location || null,
        isRecurrent: false,
        recurrenceType: 'single',
        date: new Date(formData.date + "T12:00:00"),
        month: monthLabel,
        year: year,
        userId: userId,
      };

      if (mode === 'create') {
        await createTransaction.mutateAsync(baseTransactionData as any);
      } else {
        await updateTransaction.mutateAsync({
          id: formData.id,
          ...baseTransactionData
        } as any);
      }
      close();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação');
    }
  }

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
    <div className="flex flex-col gap-6 mt-4 pb-8">
      {/* Type Toggle */}
      <div className="flex p-1 bg-muted rounded-xl w-full mx-auto">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            formData.type === 'expense'
              ? "bg-background text-red-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            formData.type === 'income'
              ? "bg-background text-emerald-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Receita
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <Label className="text-muted-foreground">Valor da transação</Label>
          <div className="relative w-full">
            <NumericFormat
              customInput={Input}
              value={formData.amount}
              onValueChange={(values) => setFormData({ ...formData, amount: values.floatValue || '' })}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              className={cn(
                "text-4xl font-bold text-center h-16 bg-transparent border-none focus-visible:ring-0 shadow-none",
                formData.type === 'expense' ? "text-red-600" : "text-emerald-600"
              )}
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</Label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
              placeholder="Ex: Supermercado"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="h-12 bg-muted/50 border-0 focus:ring-1 focus:ring-primary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => {
                if (v === '__new__') setShowNewCategory(true);
                else setFormData({ ...formData, category: v });
              }}
            >
              <SelectTrigger className="h-12 bg-muted/50 border-0 focus:ring-1 focus:ring-primary/50">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                <SelectItem value="__new__" className="text-primary font-medium">+ Nova Categoria</SelectItem>
              </SelectContent>
            </Select>
            {showNewCategory && (
              <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da categoria"
                  className="flex-1 h-10"
                />
                <Button type="button" onClick={handleAddCategory} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">OK</Button>
                <Button type="button" variant="ghost" onClick={() => setShowNewCategory(false)} className="h-10 px-3">✕</Button>
              </div>
            )}
          </div>

          {formData.type === 'expense' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Responsável <span className="text-[10px] lowercase font-normal">(Opcional)</span></Label>
              <Select
                value={formData.responsible || 'none'}
                onValueChange={(v) => {
                  if (v === '__new__') setShowNewResponsavel(true);
                  else setFormData({ ...formData, responsible: v === 'none' ? '' : v });
                }}
              >
                <SelectTrigger className="h-12 bg-muted/50 border-0 focus:ring-1 focus:ring-primary/50">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {activeResponsiblePersons.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                  <SelectItem value="__new__" className="text-primary font-medium">+ Novo Responsável</SelectItem>
                </SelectContent>
              </Select>
              {showNewResponsavel && (
                <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                  <Input
                    type="text"
                    value={newResponsavelName}
                    onChange={(e) => setNewResponsavelName(e.target.value)}
                    placeholder="Nome do responsável"
                    className="flex-1 h-10"
                  />
                  <Button type="button" onClick={handleAddResponsavel} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10">OK</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowNewResponsavel(false)} className="h-10 px-3">✕</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 mt-2">
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSaving || !formData.amount || !formData.description || !formData.category} 
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isSaving ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </div>
  );
}
