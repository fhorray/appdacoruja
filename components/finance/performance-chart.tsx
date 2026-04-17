"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceData {
    month: string;
    income: number;
    expense: number;
}

interface PerformanceChartProps {
    data: PerformanceData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    const maxVal = useMemo(() => {
        const allVals = data.flatMap(d => [d.income, d.expense]);
        return Math.max(...allVals, 100);
    }, [data]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL',
            maximumFractionDigits: 0 
        }).format(val);

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h3 className="text-lg font-semibold text-foreground">Desempenho Semestral</h3>
                     <p className="text-sm text-muted-foreground">Comparativo de entradas e saídas</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Receitas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Despesas</span>
                    </div>
                </div>
            </div>

            <div className="h-[240px] flex items-end justify-between gap-2 pt-4 px-2">
                {data.map((item, idx) => {
                    const incHeight = (item.income / maxVal) * 100;
                    const expHeight = (item.expense / maxVal) * 100;

                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full flex items-end justify-center gap-1 h-full min-h-[40px]">
                                {/* Income Bar */}
                                <div 
                                    className="w-1/3 min-w-[8px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110 relative"
                                    style={{ height: `${incHeight}%` }}
                                >
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold border">
                                        {formatCurrency(item.income)}
                                    </div>
                                </div>
                                {/* Expense Bar */}
                                <div 
                                    className="w-1/3 min-w-[8px] bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110 relative"
                                    style={{ height: `${expHeight}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold border">
                                        {formatCurrency(item.expense)}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                {item.month}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
