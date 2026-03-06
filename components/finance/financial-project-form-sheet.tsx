'use client';

import { useState, useEffect } from "react";
import { useForm } from "@/hooks/use-form";
import { useInvestments } from "@/hooks/use-investments";
import { CustomSheet } from "@/components/custom-sheet";
import { Button } from "@/components/ui/button";
import { Target, CalendarDays, TrendingUp, Landmark } from "lucide-react";
import { SelectFinancialProject } from "@/server/database/schemas";
import { toast } from "sonner";

interface FinancialProjectFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: SelectFinancialProject | null;
}

export function FinancialProjectFormSheet({ isOpen, onClose, userId, initialData }: FinancialProjectFormSheetProps) {
  const { createFinancialProject, updateFinancialProject } = useInvestments(userId);
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      targetValue: initialData?.targetValue || ("" as any as number),
      accumulatedValue: initialData?.accumulatedValue || ("" as any as number),
      targetDate: initialData?.targetDate || "",
      estimatedYield: initialData?.estimatedYield || 10,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          name: value.name,
          targetValue: Number(value.targetValue),
          accumulatedValue: Number(value.accumulatedValue || 0),
          targetDate: value.targetDate,
          estimatedYield: Number(value.estimatedYield),
        };

        if (isEditing) {
          await updateFinancialProject.mutateAsync({
            id: initialData!.id,
            data: payload
          });
          toast.success("Projeto atualizado!");
        } else {
          await createFinancialProject.mutateAsync(payload);
          toast.success("Projeto criado com sucesso!");
        }
        onClose();
      } catch (error) {
        toast.error("Ocorreu um erro ao salvar o projeto.");
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldValue("name", initialData.name);
        form.setFieldValue("targetValue", initialData.targetValue);
        form.setFieldValue("accumulatedValue", initialData.accumulatedValue);
        form.setFieldValue("targetDate", initialData.targetDate);
        form.setFieldValue("estimatedYield", initialData.estimatedYield);
      } else {
        form.reset();
      }
    }
  }, [isOpen, initialData, form]);

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEditing ? "Editar Projeto" : "Novo Projeto Financeiro"}
      description={isEditing ? "Altere as informações do seu projeto." : "Planeje uma nova meta de longo prazo com metas e prazos."}
      className="px-4 !max-w-xl"
      content={
        <div className="space-y-6 px-4">
          <form
            id="financial-project-form"
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
                    label="Nome do Projeto" 
                    icon={Target as any} 
                    placeholder="Ex: Reserva de Emergência, Viagem..." 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.AppField
                  name="targetValue"
                  validators={{
                    onChange: ({ value }) => {
                       const num = Number(value);
                       if (isNaN(num) || num <= 0) return "A meta deve ser maior que zero";
                       return undefined;
                    }
                  }}
                  children={(field) => (
                    <field.MoneyField 
                      label="Valor da Meta" 
                      placeholder="R$ 10.000,00" 
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                  )}
                />

                <form.AppField
                  name="accumulatedValue"
                  children={(field) => (
                    <field.MoneyField 
                      label="Já acumulado" 
                      placeholder="R$ 0,00" 
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.AppField
                  name="targetDate"
                  validators={{
                    onChange: ({ value }) => !value ? "Data alvo é obrigatória" : undefined,
                  }}
                  children={(field) => (
                    <field.InputField 
                      type="date" 
                      label="Data Alvo" 
                      icon={CalendarDays as any} 
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                  )}
                />

                <form.AppField
                  name="estimatedYield"
                  children={(field) => (
                    <field.InputField 
                      type="number" 
                      label="Rendimento Esperado (% a.a)" 
                      icon={TrendingUp as any} 
                      step="0.1"
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                  )}
                />
              </div>
            </div>
          </form>
        </div>
      }
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="financial-project-form" 
            className="w-full h-11 rounded-xl"
            disabled={isEditing ? updateFinancialProject.isPending : createFinancialProject.isPending}
          >
            {isEditing ? (updateFinancialProject.isPending ? "Salvando..." : "Salvar") : (createFinancialProject.isPending ? "Criando..." : "Criar")}
          </Button>
        </div>
      }
    />
  );
}
