"use client";

import { useForm } from '@/hooks/use-form';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface CreditCardFormSheetProps {
  children?: React.ReactNode;
  initialData?: any;
  mode: 'create' | 'edit';
  userId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreditCardFormSheet({ children, initialData, mode, userId, isOpen, onClose }: CreditCardFormSheetProps) {
  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
      }}
      title={mode === 'create' ? 'Novo Cartão de Crédito' : 'Editar Cartão'}
      className="px-4 !max-w-xl"
      content={({ close }) => (
        <CreditCardFormContent initialData={initialData} mode={mode} close={close} />
      )}
    >
      {children}
    </CustomSheet>
  );
}

const BRAND_OPTIONS = [
  { label: 'Mastercard', value: 'mastercard' },
  { label: 'Visa', value: 'visa' },
  { label: 'Elo', value: 'elo' },
  { label: 'Amex', value: 'amex' },
  { label: 'Outro', value: 'other' },
];

function CreditCardFormContent({ initialData, mode, close }: { initialData: any, mode: 'create'|'edit', close: () => void }) {
  const { createCreditCard, updateCreditCard } = useCreditCards();

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      brand: initialData?.brand || 'mastercard',
      creditLimit: initialData?.creditLimit || 0,
      closingDay: initialData?.closingDay || 1,
      dueDay: initialData?.dueDay || 10,
      color: initialData?.color || '#3b82f6',
      lastFourDigits: initialData?.lastFourDigits || '',
    },
    onSubmit: async ({ value }) => {
      if (mode === 'create') {
        await createCreditCard.mutateAsync(value as any);
      } else {
        await updateCreditCard.mutateAsync({ id: initialData.id, data: value as any });
      }
      close();
    }
  });

  const isSaving = createCreditCard.isPending || updateCreditCard.isPending;

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6 mt-4 pb-8 h-full px-4"
    >
      <div className="flex-1 space-y-4">
        <form.AppField
          name="name"
          children={(field) => (
            <field.InputField
              label="Nome do Cartão"
              placeholder="Ex: Nubank, Inter..."
              className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
              required
            />
          )}
        />

        <form.AppField
          name="brand"
          children={(field) => (
            <field.SelectField
              label="Bandeira"
              className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
              options={BRAND_OPTIONS}
            />
          )}
        />

        <div className="space-y-2">
            <Label className="text-sm font-medium">Limite do Cartão</Label>
            <form.AppField
                name="creditLimit"
                children={(field) => (
                <field.MoneyField
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    placeholder="R$ 0,00"
                />
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="closingDay"
            children={(field) => (
              <field.InputField
                label="Dia de Fechamento"
                type="number"
                min={1}
                max={31}
                required
              />
            )}
          />

          <form.AppField
            name="dueDay"
            children={(field) => (
              <field.InputField
                label="Dia de Vencimento"
                type="number"
                min={1}
                max={31}
                required
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <form.AppField
            name="lastFourDigits"
            children={(field) => (
                <field.InputField
                label="Últimos 4 dígitos (opcional)"
                placeholder="Ex: 1234"
                maxLength={4}
                />
            )}
            />

            <form.AppField
            name="color"
            children={(field) => (
                <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Cor de Destaque
                </Label>
                <div className="flex gap-2">
                    <Input
                    type="color"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex-1 font-mono uppercase"
                    placeholder="#000000"
                    maxLength={7}
                    />
                </div>
                </div>
            )}
            />
        </div>
      </div>

      <div className="pt-4 border-t sticky bottom-0 bg-background">
        <Button 
          type="submit" 
          className=""
          disabled={isSaving}
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            'Salvar Cartão'
          )}
        </Button>
      </div>
    </form>
  );
}
