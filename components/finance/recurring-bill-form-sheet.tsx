import { useState, useEffect } from "react";
import { useForm } from "@/hooks/use-form";
import { useRecurringBills } from "@/hooks/use-recurring-bills";
import { useFinance } from "@/hooks/use-finance";
import { CustomSheet } from "@/components/custom-sheet";
import { Button } from "@/components/ui/button";
import { CalendarClock, Hash, Palette, Tag, AlignLeft, CalendarDays, AlignLeftIcon } from "lucide-react";
import { SelectRecurringBill } from "@/server/database/schemas";
import { toast } from "sonner";

const PREDEFINED_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

interface RecurringBillFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: SelectRecurringBill | null;
}

export function RecurringBillFormSheet({ isOpen, onClose, userId, initialData }: RecurringBillFormSheetProps) {
  const { createRecurringBill, updateRecurringBill } = useRecurringBills(userId);
  const { categoriesQuery } = useFinance(userId);
  const isEditing = !!initialData;

  const categories = categoriesQuery.data?.filter(c => c.isActive && c.type === 'expense') || [];

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      amount: initialData?.amount || ("" as any as number),
      category: initialData?.category || "",
      dueDay: initialData?.dueDay || ("" as any as number),
      type: initialData?.type || "fixed_bill",
      color: initialData?.color || PREDEFINED_COLORS[0],
      notes: initialData?.notes || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          name: value.name,
          amount: Number(value.amount),
          category: value.category,
          dueDay: Number(value.dueDay),
          type: value.type,
          color: value.color,
          notes: value.notes,
        };

        if (isEditing) {
          await updateRecurringBill.mutateAsync({
            id: initialData!.id,
            data: payload
          });
        } else {
          await createRecurringBill.mutateAsync(payload);
        }
        onClose();
      } catch (error) {
        // Error toast handled in hook
      }
    }
  });

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldValue("name", initialData.name);
        form.setFieldValue("amount", initialData.amount);
        form.setFieldValue("category", initialData.category);
        form.setFieldValue("dueDay", initialData.dueDay);
        form.setFieldValue("type", initialData.type as any);
        form.setFieldValue("color", initialData.color || PREDEFINED_COLORS[0]);
        form.setFieldValue("notes", initialData.notes || "");
      } else {
        form.reset();
      }
    }
  }, [isOpen, initialData, form]);

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditing ? "Editar Conta Recorrente" : "Nova Conta Recorrente"}
      description={isEditing ? "Altere os detalhes da sua assinatura ou conta fixa." : "Gerencie suas despesas recorrentes para ter uma previsão real do seu saldo."}
      
      className="px-4 !max-w-xl"
      content={
        <div className="space-y-6">
          <form
            id="recurring-bill-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) => !value ? "Nome é obrigatório" : undefined,
                }}
                children={(field) => (
                  <field.InputField label="Nome da Conta" icon={CalendarClock as any} placeholder="Ex: Netflix, Internet, Academia" />
                )}
              />

              <form.AppField
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                     const num = Number(value);
                     if (isNaN(num) || num <= 0) return "O valor deve ser maior que zero";
                     return undefined;
                  }
                }}
                children={(field) => (
                  <field.MoneyField 
                    label="Valor Estimado" 
                    placeholder="R$ 0,00" 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <form.AppField
                    name="category"
                    validators={{
                        onChange: ({ value }) => !value ? "Categoria é obrigatória" : undefined,
                    }}
                    children={(field) => (
                    <field.SelectField
                        label="Categoria"
                        options={categories.map(c => ({ value: c.name, label: c.name }))}
                        className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                    )}
                />

                <form.AppField
                    name="dueDay"
                    validators={{
                        onChange: ({ value }) => {
                            const num = Number(value);
                            if (isNaN(num) || num < 1 || num > 31) return "Dia inválido (1-31)";
                            return undefined;
                        }
                    }}
                    children={(field) => (
                    <field.InputField 
                      type="number" 
                      label="Dia de Vencimento" 
                      icon={Hash as any} 
                      placeholder="Ex: 5" 
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                    )}
                />
              </div>

              <form.AppField
                name="type"
                children={(field) => (
                  <field.SelectField
                    label="Tipo de Conta"
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    options={[
                        { value: "fixed_bill", label: "Conta Fixa (Essencial)" },
                        { value: "subscription", label: "Assinatura (Lazer/Extra)" }
                    ]}
                  />
                )}
              />

              <div className="space-y-3">
                 <label className="text-sm font-medium leading-none flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" /> Cor de destaque
                 </label>
                 <form.AppField
                    name="color"
                    children={(field) => (
                        <div className="flex flex-wrap gap-3">
                            {PREDEFINED_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${field.state.value === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => field.handleChange(color)}
                                />
                            ))}
                        </div>
                    )}
                 />
              </div>

              <form.AppField
                name="notes"
                children={(field) => (
                  <field.TextareaField label="Observações (Opcional)" placeholder="Algum detalhe extra?" />
                )}
              />

            </div>
          </form>
        </div>
      }
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="outline" onClick={onClose} className="">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="recurring-bill-form" 
            className=""
            disabled={isEditing ? updateRecurringBill.isPending : createRecurringBill.isPending}
          >
            {isEditing ? (updateRecurringBill.isPending ? "Salvando..." : "Salvar") : (createRecurringBill.isPending ? "Criando..." : "Criar")}
          </Button>
        </div>
      }
    />
  );
}
