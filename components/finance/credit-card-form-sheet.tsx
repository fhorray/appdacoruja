"use client";
import * as React from 'react';

import { useForm } from '@/hooks/use-form';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { CustomSheet } from '../custom-sheet';
import { Button } from '../ui/button';
import { Loader2, CreditCard, Calendar, Landmark, Hash, Palette, Check } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { useStore } from '@tanstack/react-form';

interface CreditCardFormSheetProps {
  children?: React.ReactNode;
  initialData?: any;
  mode: 'create' | 'edit';
  userId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreditCardFormSheet({ children, initialData, mode, userId, isOpen, onClose }: CreditCardFormSheetProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
      }}
      title={mode === 'create' ? 'Novo Cartão de Crédito' : 'Editar Cartão'}
      className="px-4 !max-w-xl"
      content={({ close }) => (
        <CreditCardFormContent formRef={formRef} initialData={initialData} mode={mode} close={close} />
      )}
      footer={({ close }) => (
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            className="w-full h-12 rounded-md text-base font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {mode === 'create' ? 'Cadastrar Cartão' : 'Atualizar Cartão'}
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

const BRAND_OPTIONS = [
  { label: 'Mastercard', value: 'mastercard' },
  { label: 'Visa', value: 'visa' },
  { label: 'Elo', value: 'elo' },
  { label: 'Amex', value: 'amex' },
  { label: 'Outro', value: 'other' },
];

const COLOR_PRESETS = [
  { name: 'Nubank', value: '#8a05be' },
  { name: 'Inter', value: '#ff7a00' },
  { name: 'Itaú', value: '#ec7000' },
  { name: 'XP', value: '#000000' },
  { name: 'BTG', value: '#001b3d' },
  { name: 'Santander', value: '#ec0000' },
  { name: 'C6 Bank', value: '#2e2e2e' },
  { name: 'Default', value: '#3b82f6' },
];

function CardPreview({ name, brand, color, lastFourDigits, limit }: { name: string, brand: string, color: string, lastFourDigits?: string, limit?: number }) {
  return (
    <div
      className="relative w-full aspect-[1.85/1] rounded-2xl p-6 text-white shadow-2xl overflow-hidden transition-all duration-500 animate-in zoom-in-95"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      }}
    >
      {/* Decorative glass elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">Nome do Cartão</span>
            <span className="text-xl font-bold tracking-tight truncate max-w-[180px]">
              {name || "Seu Cartão"}
            </span>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
            {brand || "Visa"}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md shadow-inner border border-yellow-300/30" />
            <div className="flex gap-1.5 opacity-80 font-mono text-lg tracking-widest">
              <span>••••</span>
              <span>••••</span>
              <span>••••</span>
              <span>{lastFourDigits || "••••"}</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] uppercase tracking-widest opacity-60">Limite Estimado</span>
              <span className="text-sm font-semibold tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(limit || 0)}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="text-[7px] uppercase tracking-widest opacity-50">CVV</span>
                <span className="text-[10px] font-bold">123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreditCardFormContent({ initialData, mode, close, formRef }: { initialData: any, mode: 'create' | 'edit', close: () => void, formRef: React.RefObject<HTMLFormElement | null> }) {
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

  const nameVal = useStore(form.store, (state) => state.values.name);
  const brandVal = useStore(form.store, (state) => state.values.brand);
  const colorVal = useStore(form.store, (state) => state.values.color);
  const digitsVal = useStore(form.store, (state) => state.values.lastFourDigits);
  const limitVal = useStore(form.store, (state) => state.values.creditLimit);

  const isSaving = createCreditCard.isPending || updateCreditCard.isPending;

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6 mt-2 pb-4"
    >
      <div className="flex-1 space-y-8 px-1">

        {/* Card Preview Section */}
        <div className="flex flex-col gap-4">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Visualização do Cartão</Label>
          <CardPreview
            name={nameVal}
            brand={brandVal}
            color={colorVal}
            lastFourDigits={digitsVal}
            limit={limitVal}
          />
        </div>

        <div className="space-y-6">
          <form.AppField
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="w-4 h-4 text-primary" />
                  Nome do Cartão
                </Label>
                <Input
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-3"
                  placeholder="Ex: Nubank, Inter..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="brand"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Bandeira
                  </Label>
                  <field.SelectField
                    className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-2 text-sm"
                    options={BRAND_OPTIONS}
                  />
                </div>
              )}
            />

            <form.AppField
              name="lastFourDigits"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Hash className="w-4 h-4 text-primary" />
                    Dígitos
                  </Label>
                  <Input
                    className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-3"
                    placeholder="Ex: 1234"
                    maxLength={4}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <form.AppField
            name="creditLimit"
            children={(field) => (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="w-4 h-4 text-primary" />
                  Limite de Crédito
                </Label>
                <field.MoneyField
                  className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-md px-3 text-base font-bold"
                  placeholder="R$ 0,00"
                />
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="closingDay"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-primary" />
                    Fechamento
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg px-3"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    required
                  />
                </div>
              )}
            />

            <form.AppField
              name="dueDay"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-primary" />
                    Vencimento
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg px-3"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    required
                  />
                </div>
              )}
            />
          </div>

          <form.AppField
            name="color"
            children={(field) => (
              <div className="space-y-4 pb-4">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Palette className="w-4 h-4 text-primary" />
                  Cor do Cartão
                </Label>

                <div className="flex flex-wrap gap-3">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => field.handleChange(p.value)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all ring-offset-2 ring-primary/20",
                        field.state.value === p.value ? "ring-2 scale-110 shadow-lg" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: p.value }}
                      title={p.name}
                    >
                      {field.state.value === p.value && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}

                  <div className="relative">
                    <input
                      type="color"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                    />
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground transition-all",
                        !COLOR_PRESETS.find(p => p.value === field.state.value) && "ring-2 ring-primary ring-offset-2 border-primary/50 text-primary"
                      )}
                      style={!COLOR_PRESETS.find(p => p.value === field.state.value) ? { backgroundColor: field.state.value } : {}}
                    >
                      {!COLOR_PRESETS.find(p => p.value === field.state.value) ? (
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      ) : (
                        <Palette className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </form>
  );
}
