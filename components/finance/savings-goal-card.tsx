import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, MoreVertical, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { SelectSavingsGoal } from "@/server/database/schemas";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";

interface SavingsGoalCardProps {
  goal: SelectSavingsGoal;
  onEdit: (goal: SelectSavingsGoal) => void;
  onDelete: (goal: SelectSavingsGoal) => void;
  onDeposit: (goal: SelectSavingsGoal) => void;
  onWithdraw: (goal: SelectSavingsGoal) => void;
  isPrivate?: boolean;
}

export function SavingsGoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onDeposit, 
  onWithdraw,
  isPrivate = false 
}: SavingsGoalCardProps) {
  
  const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = progress >= 100;
  
  const IconComponent = goal.icon && (Icons as any)[goal.icon] ? (Icons as any)[goal.icon] : Target;

  const formatCurrency = (value: number) => {
    if (isPrivate) return 'R$ ••••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 group hover:shadow-md border-border/50",
      isCompleted ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50" : "bg-card"
    )}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "p-2.5 rounded-xl flex items-center justify-center",
                isCompleted ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-primary/10 text-primary"
              )}
              style={!isCompleted && goal.color ? { backgroundColor: `${goal.color}15`, color: goal.color } : {}}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-base leading-none mb-1.5 line-clamp-1">{goal.name}</h3>
              {goal.targetDate ? (
                <p className="text-xs text-muted-foreground">
                  Alvo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{isCompleted ? 'Meta Atingida!' : 'Em progresso'}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onDeposit(goal)} className="text-primary font-medium">
                Adicionar Dinheiro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWithdraw(goal)}>
                Retirar Dinheiro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit2 className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(goal)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mt-6">
          <div className="flex justify-between items-end">
            <div>
              <span className={cn(
                "text-2xl font-bold tracking-tight",
                isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              )}>
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                de {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}>
              {progress.toFixed(0)}%
            </span>
          </div>

          <Progress 
            value={progress} 
            className="h-2.5 bg-secondary/50" 
            indicatorClassName={cn(
              "transition-all duration-500",
              isCompleted ? "bg-emerald-500" : (goal.color ? "" : "bg-primary")
            )}
            style={{ 
              ...(goal.color && !isCompleted ? { '--progress-color': goal.color } as any : {})
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
