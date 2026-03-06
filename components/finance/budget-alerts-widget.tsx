"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BudgetAlertsWidgetProps {
    alerts: {
        category: string;
        limit: number;
        spent: number;
        percentage: number;
    }[];
}

export function BudgetAlertsWidget({ alerts }: BudgetAlertsWidgetProps) {
    if (!alerts || alerts.length === 0) return null;

    // Grab the top 3 highest percentage budgets that are at least 50% consumed
    const activeAlerts = alerts.filter(a => a.percentage >= 50).slice(0, 3);

    if (activeAlerts.length === 0) return null;

    return (
        <Card className="col-span-full xl:col-span-2 shadow-sm order-5 xl:order-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Alertas de Orçamento
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-primary">
                    <Link href="/limits">
                        Configurar
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {activeAlerts.map(alert => {
                        const isDanger = alert.percentage >= 100;
                        const isWarning = alert.percentage >= 80 && !isDanger;
                        const bgColor = isDanger ? "bg-red-600" : isWarning ? "bg-amber-500" : "bg-emerald-500";
                        const textColor = isDanger ? "text-red-600" : isWarning ? "text-amber-500" : "text-emerald-500";
                        const Icon = isDanger ? AlertCircle : isWarning ? AlertTriangle : CheckCircle2;

                        return (
                            <div key={alert.category} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Icon className={cn("w-4 h-4", textColor)} />
                                        {alert.category}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.spent)}</span>
                                        <span className={cn("font-medium", textColor)}>{Math.min(alert.percentage, 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                <Progress 
                                    value={Math.min(alert.percentage, 100)} 
                                    className="h-1.5" 
                                    indicatorClassName={bgColor}
                                />
                            </div>
                        )
                    })}
                </div>
                
                <Button variant="ghost" size="sm" asChild className="w-full mt-4 sm:hidden text-muted-foreground">
                    <Link href="/limits">
                        Configurar orçamentos
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
