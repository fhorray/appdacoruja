"use client";

import * as React from 'react';
import { format } from 'date-fns';
import { useFinance } from '@/hooks/use-finance';
import { useForm } from '@/hooks/use-form';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useCreditCards } from '@/hooks/use-credit-cards';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { useStore } from '@tanstack/react-form';
import { Label } from '../ui/label';

interface TransactionFormModalProps {
  children?: React.ReactNode;
  initialData?: any;
  mode: 'create' | 'edit';
  userId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

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

export function TransactionFormModal({ children, initialData, mode, userId, isOpen, onClose }: TransactionFormModalProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const title = mode === 'create' ? 'Nova Transação' : 'Editar Transação';
  const description = mode === 'create'
    ? 'Preencha os dados abaixo para cadastrar uma nova movimentação.'
    : 'Altere os dados da transação conforme necessário.';

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={isOpen !== undefined && onClose ? (open) => {
        if (!open) onClose();
      } : undefined}
      title={title}
      description={description}
      className="px-4 !max-w-2xl"
      content={({ close }) => (
        <TransactionFormContent
          formRef={formRef}
          initialData={initialData}
          mode={mode}
          userId={userId}
          close={close}
        />
      )}
      footer={({ close }) => (
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            className="w-full h-12 rounded-md text-base font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {mode === 'create' ? 'Salvar Transação' : 'Atualizar Transação'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={close}
            className="w-full h-10 rounded-md text-muted-foreground font-medium"
          >
            Cancelar
          </Button>
        </div>
      )}
    >
      {children}
    </CustomSheet>
  );
}

function TransactionFormContent({
  initialData,
  mode,
  userId,
  close,
  formRef
}: {
  initialData: any,
  mode: 'create' | 'edit',
  userId: string,
  close: () => void,
  formRef: React.RefObject<HTMLFormElement | null>
}) {
  const {
    categoriesQuery,
    responsiblePersonsQuery,
    transactionsQuery,
    createTransaction,
    updateTransaction
  } = useFinance(userId);

  const { creditCardsQuery } = useCreditCards();
  const activeCards = (creditCardsQuery.data || []).filter((c: any) => c.isActive);

  const initialDate = initialData?.date || initialData?.data || format(new Date(), 'yyyy-MM-dd');
  const initialAmount = initialData?.amount || initialData?.valor || 0;
  const initialType = initialData?.type || initialData?.tipo || 'expense';

  const form = useForm({
    defaultValues: {
      id: initialData?.id || '',
      type: (initialType as 'expense' | 'income') || 'expense',
      date: typeof initialDate === 'string' ? initialDate.split('T')[0] : format(new Date(initialDate), 'yyyy-MM-dd'),
      amount: Number(initialAmount),
      description: initialData?.description || initialData?.descricao || '',
      category: initialData?.category || initialData?.categoria || '',
      status: initialData?.status || 'paid',
      responsible: (initialData?.responsible || initialData?.responsavel || 'none') === '' ? 'none' : (initialData?.responsible || initialData?.responsavel || 'none'),
      paymentMethod: initialData?.paymentMethod || initialData?.formaPagamento || 'money',
      creditCardId: initialData?.creditCardId || initialData?.cartaoId || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const [yearStr, monthStr] = value.date.split('-');
        const year = parseInt(yearStr);
        const monthLabel = `${yearStr}-${monthStr}`;

        const payload = {
          type: value.type,
          amount: Number(value.amount),
          description: value.description,
          category: value.category,
          status: value.status,
          responsible: value.responsible === 'none' ? null : value.responsible,
          paymentMethod: value.paymentMethod,
          creditCardId: value.paymentMethod === 'credit_card' ? value.creditCardId : null,
          date: new Date(value.date + "T12:00:00"),
          month: monthLabel,
          year: year,
          userId: userId,
        };

        if (mode === 'create') {
          await createTransaction.mutateAsync(payload as any);
        } else {
          await updateTransaction.mutateAsync({
            id: initialData.id,
            ...payload
          } as any);
        }
        close();
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    },
  });

  const formType = useStore(form.store, (state: any) => state.values.type);
  const paymentMethodVal = useStore(form.store, (state: any) => state.values.paymentMethod);
  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  const activeCategories = (categoriesQuery.data || []).filter(c => c.isActive);
  const filteredCategories = activeCategories.filter(c => c.type === formType);
  const activeResponsiblePersons = (responsiblePersonsQuery.data || []).filter(r => r.isActive);

  // If credit card is selected, it must be an expense
  const canSubmit = formType === 'expense' || paymentMethodVal !== 'credit_card';

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="space-y-6">
        {/* Value Input Section */}
        <div className="flex flex-col gap-1 items-center justify-center py-6 bg-primary/5 rounded-md border border-primary/10">
          <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Valor da Transação</Label>
          <form.AppField
            name="amount"
            children={(field) => (
              <field.MoneyField
                className={cn(
                  "h-16 bg-transparent border-none text-4xl font-black text-center focus-visible:ring-0 shadow-none px-0",
                  formType === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                )}
                placeholder="R$ 0,00"
              />
            )}
          />
        </div>

        {/* Transaction Type Tags */}
        <form.AppField
          name="type"
          children={(field) => (
            <div className="flex p-1 bg-muted/30 rounded-md gap-1 border border-border/50">
              <button
                type="button"
                onClick={() => {
                  field.handleChange('expense');
                  form.setFieldValue('category', '');
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-9 rounded-md text-sm font-bold transition-all",
                  field.state.value === 'expense'
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowDownRight className={cn("w-4 h-4", field.state.value === 'expense' ? "text-red-500" : "")} />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => {
                  field.handleChange('income');
                  form.setFieldValue('category', '');
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-9 rounded-md text-sm font-bold transition-all",
                  field.state.value === 'income'
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowUpRight className={cn("w-4 h-4", field.state.value === 'income' ? "text-emerald-500" : "")} />
                Receita
              </button>
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <form.AppField
              name="description"
              children={(field) => (
                <field.InputField
                  label="Descrição"
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-3"
                  placeholder="Ex: Supermercado"
                  required
                />
              )}
            />
          </div>

          <form.AppField
            name="date"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <field.InputField
                  label="Data"
                  type="date"
                  className="h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground px-3 rounded-md"
                  required
                />
              </div>
            )}
          />

          <form.AppField
            name="status"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <field.SelectField
                  label="Status"
                  options={STATUS_OPTIONS}
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2"
                />
              </div>
            )}
          />

          <form.AppField
            name="category"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <field.SelectField
                  label="Categoria"
                  placeholder="Selecione uma categoria"
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2"
                  options={[
                    ...filteredCategories.map(c => ({ label: c.name, value: c.name })),
                    { label: "+ Nova Categoria", value: "__new__" }
                  ]}
                  onValueChange={(val) => {
                    if (val === '__new__') {
                      // Handled elsewhere or via modal
                    } else {
                      field.handleChange(val);
                    }
                  }}
                />
              </div>
            )}
          />

          <form.AppField
            name="paymentMethod"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <field.SelectField
                  label="Forma de Pagamento"
                  options={PAYMENT_METHOD_OPTIONS}
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2"
                  required
                  onValueChange={(val) => {
                    field.handleChange(val);
                    if (val === 'credit_card') {
                      form.setFieldValue('type', 'expense');
                    }
                  }}
                />
              </div>
            )}
          />

          {paymentMethodVal === 'credit_card' && (
            <div className="md:col-span-2 animate-in slide-in-from-top-2">
              <form.AppField
                name="creditCardId"
                children={(field) => (
                  <div className="flex flex-col gap-2">
                    <field.SelectField
                      label="Cartão de Crédito"
                      placeholder="Selecione o cartão"
                      options={activeCards.map((c: any) => ({ label: c.name, value: c.id }))}
                      className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2"
                      required
                    />
                  </div>
                )}
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 ml-1">
                <AlertCircle className="w-3 h-3" />
                Transações no cartão ficam em aberto até o pagamento da fatura.
              </p>
            </div>
          )}

          <form.AppField
            name="responsible"
            children={(field) => (
              <div className="flex flex-col gap-2 md:col-span-2">
                <field.SelectField
                  label="Responsável (Opcional)"
                  placeholder="Selecione o responsável"
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2"
                  options={[
                    { label: "Nenhum", value: "none" },
                    ...activeResponsiblePersons.map(r => ({ label: r.name, value: r.name })),
                    { label: "+ Novo Responsável", value: "__new__" }
                  ]}
                />
              </div>
            )}
          />
        </div>

        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando...
          </div>
        )}
      </div>
    </form>
  );
}
