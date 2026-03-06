"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useForm } from '@/hooks/use-form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';
import { suggestCategory } from '@/lib/category-suggestions';
import { useCreditCards } from '@/hooks/use-credit-cards';

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
      className="px-4 !max-w-xl"
      content={({ close }) => (
        <TransactionFormContent initialData={initialData} mode={mode} userId={userId} close={close} />
      )}
    >
      {children}
    </CustomSheet>
  );
}

import { useStore } from '@tanstack/react-form';

function TransactionFormContent({ initialData, mode, userId, close }: { initialData: any, mode: 'create'|'edit', userId: string, close: () => void }) {
  const {
    categoriesQuery,
    responsiblePersonsQuery,
    createTransaction,
    updateTransaction,
    createCategory,
    createResponsiblePerson
  } = useFinance(userId);

  const { creditCardsQuery } = useCreditCards();
  const activeCards = creditCardsQuery.data?.filter(c => c.isActive) || [];

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewResponsavel, setShowNewResponsavel] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newResponsavelName, setNewResponsavelName] = useState('');

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialDate = initialData?.date || initialData?.data;
  const initialDateString = (() => {
    if (!initialDate) return getLocalDateString();
    
    // If it's already a YYYY-MM-DD string, just return it
    if (typeof initialDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      return initialDate;
    }
    
    // Try to parse it
    const d = new Date(initialDate);
    if (isNaN(d.getTime())) return getLocalDateString();
    
    // Check if it's a UTC date from the DB (which might be shifted by TZ)
    // For financial dates, we usually want the literal date part.
    // If it's an ISO string like "2024-03-06T00:00:00.000Z", new Date() is local.
    // Let's ensure we get the date parts correctly.
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const initialAmount = initialData?.amount || initialData?.valor;
  const initialType = initialData?.type || initialData?.tipo || 'expense';

  const form = useForm({
    defaultValues: {
      id: initialData?.id || '',
      type: (initialType as 'expense' | 'income') || 'expense',
      date: initialDateString,
      amount: initialAmount ? Number(initialAmount) : 0,
      description: initialData?.description || initialData?.descricao || '',
      category: initialData?.category || initialData?.categoria || '',
      status: initialData?.status || 'paid',
      responsible: (initialData?.responsible || '') === '' ? 'none' : initialData.responsible,
      paymentMethod: initialData?.paymentMethod || 'money',
      creditCardId: initialData?.creditCardId || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const [yearStr, monthStr] = value.date.split('-');
        const year = parseInt(yearStr);
        const monthLabel = `${yearStr}-${monthStr}`;

        const baseTransactionData = {
          type: value.type,
          amount: Number(value.amount),
          description: value.description,
          category: value.category,
          status: value.status,
          responsible: value.responsible === 'none' ? null : value.responsible,
          paymentMethod: value.paymentMethod,
          creditCardId: value.paymentMethod === 'credit_card' ? value.creditCardId : null,
          isRecurrent: false,
          recurrenceType: 'single',
          date: new Date(value.date + "T12:00:00"),
          month: monthLabel,
          year: year,
          userId: userId,
        };

        if (mode === 'create') {
          await createTransaction.mutateAsync(baseTransactionData as any);
        } else {
          await updateTransaction.mutateAsync({
            id: value.id,
            ...baseTransactionData
          } as any);
        }
        close();
      } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Erro ao salvar transação');
      }
    },
  });

  const formType = useStore(form.store, (state: any) => state.values.type);
  const paymentMethodVal = useStore(form.store, (state: any) => state.values.paymentMethod);
  const canSubmit = useStore(form.store, (state: any) => state.canSubmit);

  const STATUS_OPTIONS = [
    { label: 'Pago', value: 'paid' },
    { label: 'Em Aberto', value: 'pending' }
  ];

  const PAYMENT_METHOD_OPTIONS = [
    { label: 'Dinheiro', value: 'money' },
    { label: 'Cartão de Débito', value: 'debit_card' },
    { label: 'Cartão de Crédito', value: 'credit_card' },
    { label: 'Pix', value: 'pix' },
    { label: 'Transferência Bancária', value: 'bank_transfer' },
    { label: 'Boleto', value: 'bank_slip' },
    { label: 'Outro', value: 'other' }
  ];

  const filteredCategories = categoriesQuery.data?.filter(
    c => c.type === formType && c.isActive
  ) || [];

  const activeResponsiblePersons = responsiblePersonsQuery.data?.filter(
    r => r.isActive
  ) || [];

  async function handleAddCategory() {
    if (!newCategoryName.trim() || !userId) return;
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        type: formType,
        userId: userId,
        isActive: true
      });
      form.setFieldValue('category', newCategoryName.trim());
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
      form.setFieldValue('responsible', newResponsavelName.trim());
      setNewResponsavelName('');
      setShowNewResponsavel(false);
    } catch {
      alert('Erro ao adicionar responsável.');
    }
  }

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6 mt-4 pb-8"
    >
      {/* Type Toggle */}
      <div className="flex p-1 bg-muted rounded-xl w-full mx-auto">
        <button
          type="button"
          onClick={() => {
            form.setFieldValue('type', 'expense');
            form.setFieldValue('category', '');
          }}
          className={cn(
            "cursor-pointer flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            formType === 'expense' 
              ? "bg-background text-red-600 shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => {
            form.setFieldValue('type', 'income');
            form.setFieldValue('category', '');
          }}
          className={cn(
            "cursor-pointer flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            formType === 'income' 
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
            <form.AppField
              name="amount"
              children={(field) => (
                <field.MoneyField
                  className={cn(
                    "text-4xl font-bold text-center h-16 bg-transparent border-none focus-visible:ring-0 shadow-none",
                    formType === 'expense' ? "text-red-600" : "text-emerald-600"
                  )}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-5">
          <form.AppField
            name="description"
            children={(field) => (
              <field.InputField
                label="Descrição"
                className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                placeholder="Ex: Supermercado"
                required
                onChange={(e: any) => {
                    const val = e.target.value;
                    field.handleChange(val);
                    const suggested = suggestCategory(val);
                    if (val.length > 2 && suggested) {
                        form.setFieldValue('category', suggested);
                    }
                }}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="date"
              children={(field) => (
                <field.InputField
                  label="Data"
                  type="date"
                  className="h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
                  required
                />
              )}
            />
            
            <form.AppField
              name="status"
              children={(field) => (
                <field.SelectField
                  label="Status"
                  options={STATUS_OPTIONS}
                  className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <form.AppField
              name="category"
              children={(field) => (
                <field.SelectField
                  label="Categoria"
                  placeholder="Selecione uma categoria"
                  className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  options={[
                    ...filteredCategories.map(c => ({ label: c.name, value: c.name })),
                    { label: "+ Nova Categoria", value: "__new__" }
                  ]}
                  onValueChange={(v) => {
                    if (v === '__new__') setShowNewCategory(true);
                    else field.handleChange(v);
                  }}
                />
              )}
            />
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

          <div className="space-y-2">
            <form.AppField
              name="paymentMethod"
              children={(field) => (
                <field.SelectField
                  label="Forma de Pagamento"
                  options={PAYMENT_METHOD_OPTIONS}
                  className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  required
                  onValueChange={(val) => {
                      field.handleChange(val);
                      if (val !== 'credit_card') {
                          form.setFieldValue('creditCardId', '');
                          if (formType === 'expense') {
                              form.setFieldValue('status', 'paid');
                          }
                      } else {
                          form.setFieldValue('status', 'pending');
                      }
                  }}
                />
              )}
            />
          </div>

          {paymentMethodVal === 'credit_card' && formType === 'expense' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
                <form.AppField
                name="creditCardId"
                children={(field) => (
                    <field.SelectField
                    label="Cartão de Crédito"
                    placeholder="Selecione o cartão"
                    options={activeCards.map((c: any) => ({ label: c.name, value: c.id }))}
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    required
                    />
                )}
                />
            </div>
          )}

          {formType === 'expense' && (
            <div className="space-y-2">
              <form.AppField
                name="responsible"
                children={(field) => (
                  <field.SelectField
                    label="Responsável (Opcional)"
                    placeholder="Selecione o responsável"
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    options={[
                      { label: "Nenhum", value: "none" },
                      ...activeResponsiblePersons.map(r => ({ label: r.name, value: r.name })),
                      { label: "+ Novo Responsável", value: "__new__" }
                    ]}
                    onValueChange={(v) => {
                      if (v === '__new__') setShowNewResponsavel(true);
                      else field.handleChange(v === 'none' ? '' : v);
                    }}
                  />
                )}
              />
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
          type="submit" 
          disabled={isSaving || !canSubmit} 
          className="h-12 rounded-xl text-base font-semibold"
        >
          {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isSaving ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </form>
  );
}
