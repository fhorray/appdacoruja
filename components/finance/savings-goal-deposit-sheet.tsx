import { useState, useEffect } from "react";
import { useForm } from "@/hooks/use-form";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { CustomSheet } from "@/components/custom-sheet";
import { Button } from "@/components/ui/button";
import { SelectSavingsGoal } from "@/server/database/schemas";
import { toast } from "sonner";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavingsGoalDepositSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  goal: SelectSavingsGoal | null;
  initialType: 'deposit' | 'withdraw';
}

export function SavingsGoalDepositSheet({ isOpen, onClose, userId, goal, initialType }: SavingsGoalDepositSheetProps) {
  const { updateGoalAmount } = useSavingsGoals(userId);
  const [type, setType] = useState<'deposit' | 'withdraw'>(initialType);

  const form = useForm({
    defaultValues: {
      amount: "" as any as number,
    },
    onSubmit: async ({ value }) => {
      if (!goal) return;
      try {
        await updateGoalAmount.mutateAsync({
          id: goal.id,
          amount: Number(value.amount),
          type,
        });
        toast.success(type === 'deposit' ? "Valor guardado com sucesso!" : "Valor retirado com sucesso!");
        onClose();
      } catch (error) {
        toast.error("Ocorreu um erro ao atualizar o valor.");
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setType(initialType);
    }
  }, [isOpen, initialType, form]);

  if (!goal) return null;

  return (
    <CustomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={type === 'deposit' ? "Guardar Dinheiro" : "Retirar Dinheiro"}
      description={`Caixinha: ${goal.name}`}
      className="px-4 !max-w-xl"
      content={
        <div className="px-4 space-y-6">
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                type === 'deposit' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setType('deposit')}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Guardar
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                type === 'withdraw' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setType('withdraw')}
            >
              <TrendingDown className="w-4 h-4 text-destructive" />
              Retirar
            </button>
          </div>

          <div className="bg-primary/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Atual</p>
            <p className="text-3xl font-bold tracking-tight text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
            </p>
          </div>

          <form
            id="savings-deposit-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (type === 'withdraw') {
                 const amount = Number(form.getFieldValue('amount'));
                 if (amount > goal.currentAmount) {
                     toast.error("O valor da retirada não pode ser maior que o saldo atual.");
                     return;
                 }
              }

              form.handleSubmit();
            }}
            className="space-y-6"
          >
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
                <field.MoneyField label="Qual valor?" placeholder="R$ 0,00" />
              )}
            />
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
            form="savings-deposit-form" 
            className=""
            disabled={updateGoalAmount.isPending}
          >
            {updateGoalAmount.isPending ? "Processando..." : "Confirmar"}
          </Button>
        </div>
      }
    />
  );
}
