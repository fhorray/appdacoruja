import { useState, useEffect } from "react";
import { useForm } from "@/hooks/use-form";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { CustomSheet } from "@/components/custom-sheet";
import { Button } from "@/components/ui/button";
import { Target, AlignLeft, Palette, CalendarDays } from "lucide-react";
import { SelectSavingsGoal } from "@/server/database/schemas";
import { toast } from "sonner";

const GOAL_ICONS = [
  "Target", "PiggyBank", "Car", "Plane", "Home", "GraduationCap", 
  "Smartphone", "Laptop", "Heart", "Star", "Gift", "Briefcase"
];

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

interface SavingsGoalFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: SelectSavingsGoal | null;
}

export function SavingsGoalFormSheet({ isOpen, onClose, userId, initialData }: SavingsGoalFormSheetProps) {
  const { createSavingsGoal, updateSavingsGoal } = useSavingsGoals(userId);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount || ("" as any as number),
      initialAmount: isEditing ? 0 : ("" as any as number), // Only for creation
      targetDate: initialData?.targetDate || "",
      color: initialData?.color || PREDEFINED_COLORS[0],
      icon: initialData?.icon || "Target",
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateSavingsGoal.mutateAsync({
            id: initialData!.id,
            data: {
              name: value.name,
              description: value.description,
              targetAmount: Number(value.targetAmount),
              targetDate: value.targetDate,
              color: value.color,
              icon: value.icon,
            }
          });
          toast.success("Caixinha atualizada!");
        } else {
          await createSavingsGoal.mutateAsync({
            name: value.name,
            description: value.description,
            targetAmount: Number(value.targetAmount),
            initialAmount: Number(value.initialAmount || 0),
            targetDate: value.targetDate,
            color: value.color,
            icon: value.icon,
          });
          toast.success("Caixinha criada com sucesso!");
        }
        onClose();
      } catch (error) {
        toast.error("Ocorreu um erro ao salvar a caixinha.");
      }
    }
  });

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldValue("name", initialData.name);
        form.setFieldValue("description", initialData.description || "");
        form.setFieldValue("targetAmount", initialData.targetAmount);
        form.setFieldValue("targetDate", initialData.targetDate || "");
        form.setFieldValue("color", initialData.color || PREDEFINED_COLORS[0]);
        form.setFieldValue("icon", initialData.icon || "Target");
      } else {
        form.reset();
      }
    }
  }, [isOpen, initialData, form]);

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditing ? "Editar Caixinha" : "Nova Caixinha"}
      description={isEditing ? "Altere as informações da sua meta." : "Crie uma nova meta financeira para acompanhar seu progresso."}
      className="px-4 !max-w-xl"
      content={
        <div className="space-y-6 px-4 ">
          <form
            id="savings-goal-form"
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
                  <field.InputField 
                    label="Nome da Caixinha" 
                    icon={Target as any} 
                    placeholder="Ex: Viagem para Europa" 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  />
                )}
              />

              <form.AppField
                name="targetAmount"
                validators={{
                  onChange: ({ value }) => {
                     const num = Number(value);
                     if (isNaN(num) || num <= 0) return "O valor deve ser maior que zero";
                     return undefined;
                  }
                }}
                children={(field) => (
                  <field.MoneyField 
                    label="Valor da Meta" 
                    placeholder="R$ 5.000,00" 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  />
                )}
              />

              {!isEditing && (
                <form.AppField
                  name="initialAmount"
                  validators={{
                    onChange: ({ value }) => {
                       if (!value) return undefined;
                       const num = Number(value);
                       if (isNaN(num) || num < 0) return "O valor não pode ser negativo";
                       return undefined;
                    }
                  }}
                  children={(field) => (
                    <field.MoneyField label="Valor Inicial Guardado (Opcional)" placeholder="R$ 0,00" />
                  )}
                />
              )}

              <form.AppField
                name="targetDate"
                children={(field) => (
                  <field.InputField 
                    type="date" 
                    label="Data Alvo (Opcional)" 
                    icon={CalendarDays as any} 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  />
                )}
              />

              <form.AppField
                name="description"
                children={(field) => (
                  <field.TextareaField label="Descrição (Opcional)" placeholder="Detalhes adicionais sobre a meta..." />
                )}
              />

              <div className="space-y-3">
                 <label className="text-sm font-medium leading-none flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" /> Cor da Caixinha
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
                name="icon"
                children={(field) => (
                  <field.SelectField
                    label="Ícone"
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    options={GOAL_ICONS.map(i => ({ value: i, label: i }))}
                  />
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
            form="savings-goal-form" 
            className="w-full"
            disabled={isEditing ? updateSavingsGoal.isPending : createSavingsGoal.isPending}
          >
            {isEditing ? (updateSavingsGoal.isPending ? "Salvando..." : "Salvar") : (createSavingsGoal.isPending ? "Criando..." : "Criar")}
          </Button>
        </div>
      }
    />
  );
}
