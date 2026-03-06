"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectSavingsGoal } from "@/server/database/schemas";
import { cn } from "@/lib/utils";

interface SavingsGoalsWidgetProps {
    goals: SelectSavingsGoal[];
}

export function SavingsGoalsDashboardWidget({ goals }: SavingsGoalsWidgetProps) {
    if (!goals || goals.length === 0) return null;

    // Filter active and sort by percentage completion (closest to 100% first)
    const activeGoals = goals.filter(g => g.isActive && !g.isCompleted);
    const topGoals = [...activeGoals].sort((a, b) => {
        const pA = a.currentAmount / a.targetAmount;
        const pB = b.currentAmount / b.targetAmount;
        return pB - pA;
    }).slice(0, 3);

    if (topGoals.length === 0) return null;

    return (
        <Card className="col-span-full xl:col-span-2 shadow-sm order-4 xl:order-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Principais Caixinhas
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-primary">
                    <Link href="/goals">
                        Ver todas
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {topGoals.map(goal => {
                        const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
                        return (
                            <div key={goal.id} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        {goal.color && (
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.color }} />
                                        )}
                                        {goal.name}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}</span>
                                        <span className="font-medium text-foreground">{progress.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <Progress 
                                    value={progress} 
                                    className="h-1.5" 
                                    indicatorClassName={goal.color ? "" : "bg-primary"}
                                    style={{ 
                                        ...(goal.color ? { '--progress-color': goal.color } as any : {})
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
                
                <Button variant="ghost" size="sm" asChild className="w-full mt-4 sm:hidden text-muted-foreground">
                    <Link href="/goals">
                        Ver todas caixinhas
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
