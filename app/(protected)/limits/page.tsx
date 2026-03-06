"use client";

import { useState, useEffect } from 'react';
import { Target, Save, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import { cn } from '@/lib/utils';

export default function LimitsPage() {
    const { user } = useAuth();
    const userId = user?.id as string;
    const { categoriesQuery, categoryLimitsQuery, upsertCategoryLimit, transactionsQuery } = useFinance(userId || "");

    const categories = categoriesQuery.data || [];
    const limits = categoryLimitsQuery.data || [];
    const transactions = transactionsQuery.data || [];

    const [localLimits, setLocalLimits] = useState<Record<string, { monthly: number, annual: number }>>({});
    
    // Initialize state
    useEffect(() => {
        if (limits.length > 0) {
            const map: Record<string, { monthly: number, annual: number }> = {};
            limits.forEach((l: any) => {
                map[l.category] = { monthly: Number(l.monthlyLimit), annual: Number(l.annualLimit) };
            });
            // Only set if not heavily edited or just once on load
            setLocalLimits(prev => Object.keys(prev).length === 0 ? map : prev);
        }
    }, [limits]);

    const handleLimitChange = (category: string, type: 'monthly' | 'annual', value: number) => {
        setLocalLimits(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] || { monthly: 0, annual: 0 }),
                [type]: value
            }
        }));
    };

    const handleSave = async (category: string) => {
        const limit = localLimits[category];
        if (!limit) return;
        try {
            await upsertCategoryLimit.mutateAsync({
                category,
                monthlyLimit: String(limit.monthly || 0),
                annualLimit: String(limit.annual || 0),
                referenceYear: new Date().getFullYear(),
                userId
            });
            toast.success(`Limites salvos para ${category}!`);
        } catch {
            toast.error(`Erro ao salvar limites para ${category}.`);
        }
    };

    const expenseCategories = categories.filter(c => c.type === 'expense' && c.isActive);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const getStatusInfo = (pct: number) => {
        if (pct >= 100) return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-600', label: 'Ultrapassado', badgeBg: 'bg-red-50' };
        if (pct >= 80) return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500', label: 'Atenção', badgeBg: 'bg-amber-50' };
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Dentro do limite', badgeBg: 'bg-emerald-50' };
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader 
                title="Orçamentos por Categoria" 
                description="Defina limites de gastos mensais e anuais e seja alertado antes de estourar seu orçamento."
            />

            {expenseCategories.length === 0 ? (
                <EmptyState 
                    icon={Target} 
                    title="Nenhuma Categoria de Despesa" 
                    description="Crie categorias do tipo despesa para começar a definir limites." 
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {expenseCategories.map(cat => {
                        const current = localLimits[cat.name] || { monthly: 0, annual: 0 };
                        
                        // Calculate spent amounts
                        const spentTrax = transactions.filter(t => t.category === cat.name && t.type === 'expense');
                        
                        const spentMonthly = spentTrax
                            .filter(t => t.month === currentMonthStr)
                            .reduce((sum, t) => sum + Number(t.amount), 0);
                            
                        const spentAnnual = spentTrax
                            .filter(t => t.year === currentYear)
                            .reduce((sum, t) => sum + Number(t.amount), 0);

                        const monthlyPct = current.monthly > 0 ? (spentMonthly / current.monthly) * 100 : 0;
                        const annualPct = current.annual > 0 ? (spentAnnual / current.annual) * 100 : 0;

                        const monthStatus = getStatusInfo(monthlyPct);
                        const annualStatus = getStatusInfo(annualPct);

                        return (
                            <Card key={cat.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg text-foreground flex items-center justify-between">
                                        {cat.name}
                                        {current.monthly > 0 && (
                                            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", monthStatus.color, monthStatus.badgeBg)}>
                                                <monthStatus.icon className="w-3.5 h-3.5" />
                                                {monthStatus.label}
                                            </div>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 flex-1">
                                    {/* Monthly Limit */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-sm font-medium text-muted-foreground">Orçamento Mensal</label>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(spentMonthly)} <span className="text-muted-foreground mx-1">/</span> 
                                                <span className="text-muted-foreground font-normal">{formatCurrency(current.monthly)}</span>
                                            </span>
                                        </div>
                                        <NumericFormat
                                            value={current.monthly || ''}
                                            onValueChange={(values) => handleLimitChange(cat.name, 'monthly', values.floatValue || 0)}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="R$ 0,00"
                                        />
                                        {current.monthly > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                                    <span>Progresso atual</span>
                                                    <span>{Math.min(monthlyPct, 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress 
                                                    value={Math.min(monthlyPct, 100)} 
                                                    className="h-2"
                                                    indicatorClassName={monthStatus.bg}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Annual Limit */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-sm font-medium text-muted-foreground">Orçamento Anual</label>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(spentAnnual)} <span className="text-muted-foreground mx-1">/</span> 
                                                <span className="text-muted-foreground font-normal">{formatCurrency(current.annual)}</span>
                                            </span>
                                        </div>
                                        <NumericFormat
                                            value={current.annual || ''}
                                            onValueChange={(values) => handleLimitChange(cat.name, 'annual', values.floatValue || 0)}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                            placeholder="R$ 0,00"
                                        />
                                        {current.annual > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                                    <span>Progresso anual</span>
                                                    <span>{Math.min(annualPct, 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress 
                                                    value={Math.min(annualPct, 100)} 
                                                    className="h-2"
                                                    indicatorClassName={annualStatus.bg}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t mt-auto">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSave(cat.name)}
                                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all font-medium"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Orçamento
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
