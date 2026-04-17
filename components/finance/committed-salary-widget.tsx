"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, ArrowRight, CalendarClock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommittedSalaryWidgetProps {
    totalCommitted: number;
    totalIncome: number;
    upcomingBills: {
        name: string;
        amount: number;
        dueDay: number;
        type?: string | null;
        color?: string | null;
    }[];
}

export function CommittedSalaryWidget({ totalCommitted, totalIncome, upcomingBills }: CommittedSalaryWidgetProps) {
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const commitmentPercentage = totalIncome > 0 ? (totalCommitted / totalIncome) * 100 : 0;
    
    // Status colors
    const isHigh = commitmentPercentage > 60;
    const isMedium = commitmentPercentage > 30 && !isHigh;

    return (
        <Card className="col-span-full xl:col-span-2 shadow-sm order-4 xl:order-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    Salário Comprometido
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-primary">
                    <Link href="/bills">
                        Ver Contas
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="space-y-0.5">
                                <p className="text-2xl font-bold tracking-tight">
                                    {formatCurrency(totalCommitted)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Comprometido este mês
                                </p>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                                isHigh ? "bg-red-100 text-red-700" : isMedium ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            )}>
                                {commitmentPercentage.toFixed(0)}% do Salário
                            </div>
                        </div>
                        <Progress 
                            value={Math.min(commitmentPercentage, 100)} 
                            className="h-2"
                            indicatorClassName={isHigh ? "bg-red-600" : isMedium ? "bg-amber-500" : "bg-emerald-500"}
                        />
                    </div>

                    {upcomingBills.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Próximos Vencimentos
                            </p>
                            <div className="space-y-2">
                                {upcomingBills.map(bill => (
                                    <div key={bill.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bill.color || "#3b82f6" }} />
                                            <span className="truncate">{bill.name}</span>
                                            <span className="text-[10px] bg-muted px-1 rounded font-medium shrink-0">
                                                {bill.type === 'subscription' ? 'Assinatura' : `Dia ${bill.dueDay}`}
                                            </span>
                                        </div>
                                        <span className="font-semibold shrink-0">{formatCurrency(bill.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <Button variant="ghost" size="sm" asChild className="w-full mt-2 sm:hidden text-muted-foreground">
                        <Link href="/bills">
                            Gerenciar assinaturas e contas
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
