"use client";

import { useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { useAuth } from "@/hooks/use-auth";
import { SavingsGoalCard } from "@/components/finance/savings-goal-card";
import { SavingsGoalFormSheet } from "@/components/finance/savings-goal-form-sheet";
import { SavingsGoalDepositSheet } from "@/components/finance/savings-goal-deposit-sheet";
import { SelectSavingsGoal } from "@/server/database/schemas";
import { EmptyState } from "@/components/empty-state";

export default function GoalsPage() {
  const { user } = useAuth();
  const { savingsGoalsQuery, deleteSavingsGoal } = useSavingsGoals(user?.id);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SelectSavingsGoal | null>(null);
  const [depositType, setDepositType] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Filter state
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  const goals = savingsGoalsQuery.data || [];
  
  const filteredGoals = goals.filter(goal => {
      if (filter === 'active') return goal.isActive && !goal.isCompleted;
      if (filter === 'completed') return goal.isCompleted;
      return true; // all
  });

  const handleEdit = (goal: SelectSavingsGoal) => {
      setSelectedGoal(goal);
      setIsFormOpen(true);
  };

  const handleDelete = async (goal: SelectSavingsGoal) => {
      if (confirm(`Tem certeza que deseja excluir a caixinha "${goal.name}"?`)) {
          await deleteSavingsGoal.mutateAsync(goal.id);
      }
  };

  const handleDeposit = (goal: SelectSavingsGoal) => {
      setSelectedGoal(goal);
      setDepositType('deposit');
      setIsDepositOpen(true);
  };

  const handleWithdraw = (goal: SelectSavingsGoal) => {
      setSelectedGoal(goal);
      setDepositType('withdraw');
      setIsDepositOpen(true);
  };

  const openNewGoal = () => {
      setSelectedGoal(null);
      setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Minhas Caixinhas" 
          description="Acompanhe suas metas de economia e conquiste seus objetivos." 
        />
        <Button onClick={openNewGoal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Caixinha
        </Button>
      </div>

      {savingsGoalsQuery.isLoading ? (
        <div className="flex h-[30vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
            icon={PiggyBank}
            title="Nenhuma caixinha criada"
            description="Crie objetivos financeiros para guardar dinheiro com propósito."
            action={<Button onClick={openNewGoal}>Criar Caixinha</Button>}
        />
      ) : (
        <>
            <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-fit mb-6">
                <button
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setFilter('active')}
                >
                    Em Progresso
                </button>
                <button
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'completed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setFilter('completed')}
                >
                    Concluídas
                </button>
                <button
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setFilter('all')}
                >
                    Todas
                </button>
            </div>

            {filteredGoals.length === 0 ? (
                <div className="text-center py-10 bg-card rounded-xl border border-border border-dashed">
                    <p className="text-muted-foreground">Nenhuma caixinha encontrada para este filtro.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGoals.map((goal) => (
                    <SavingsGoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDeposit={handleDeposit}
                        onWithdraw={handleWithdraw}
                    />
                    ))}
                </div>
            )}
        </>
      )}

      {/* Modals */}
      <SavingsGoalFormSheet 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        userId={user?.id as string}
        initialData={selectedGoal}
      />

      <SavingsGoalDepositSheet
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        userId={user?.id as string}
        goal={selectedGoal}
        initialType={depositType}
      />
    </div>
  );
}
