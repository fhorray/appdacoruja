"use client";

import { useState, useEffect } from 'react';
import { Target, Save } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

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
            // Only set if not heavily edited or just once on load. We'll set it simply.
            setLocalLimits(prev => Object.keys(prev).length === 0 ? map : prev);
        }
    }, [limits]);

    const handleLimitChange = (category: string, type: 'monthly' | 'annual', value: string) => {
        setLocalLimits(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] || { monthly: 0, annual: 0 }),
                [type]: Number(value)
            }
        }));
    };

    const handleSave = async (category: string) => {
        const limit = localLimits[category];
        if (!limit) return;
        try {
            await upsertCategoryLimit.mutateAsync({
                category,
                monthlyLimit: String(limit.monthly),
                annualLimit: String(limit.annual),
                referenceYear: new Date().getFullYear(),
                userId
            });
            // Optional: User feedback could be added here
        } catch {
            console.error('Failed to save limit');
        }
    };

    const expenseCategories = categories.filter(c => c.type === 'expense' && c.isActive);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader 
                title="Limites de Gastos" 
                description="Defina e acompanhe metas de gastos por categoria"
            />

            {expenseCategories.length === 0 ? (
                <EmptyState 
                    icon={Target} 
                    title="Nenhuma Categoria de Despesa" 
                    description="Crie categorias do tipo despesa para começar a definir limites." 
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

                        return (
                            <Card key={cat.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg text-foreground">{cat.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 flex-1">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-sm font-medium text-muted-foreground">Limite Mensal</label>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(spentMonthly)} <span className="text-muted-foreground mx-1">/</span> 
                                                <span className="text-muted-foreground font-normal">{formatCurrency(current.monthly)}</span>
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">R$</span>
                                            <Input
                                                type="number"
                                                value={current.monthly || ''}
                                                onChange={(e) => handleLimitChange(cat.name, 'monthly', e.target.value)}
                                                className="pl-9 bg-muted/30 border-transparent hover:border-border focus:border-border focus:bg-background transition-colors"
                                            />
                                        </div>
                                        <Progress 
                                            value={Math.min(monthlyPct, 100)} 
                                            className={`h-2 ${monthlyPct > 100 ? '[&>div]:bg-red-600' : monthlyPct > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-sm font-medium text-muted-foreground">Limite Anual</label>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(spentAnnual)} <span className="text-muted-foreground mx-1">/</span> 
                                                <span className="text-muted-foreground font-normal">{formatCurrency(current.annual)}</span>
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">R$</span>
                                            <Input
                                                type="number"
                                                value={current.annual || ''}
                                                onChange={(e) => handleLimitChange(cat.name, 'annual', e.target.value)}
                                                className="pl-9 bg-muted/30 border-transparent hover:border-border focus:border-border focus:bg-background transition-colors"
                                            />
                                        </div>
                                        <Progress 
                                            value={Math.min(annualPct, 100)} 
                                            className={`h-2 ${annualPct > 100 ? '[&>div]:bg-red-600' : annualPct > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t mt-auto">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSave(cat.name)}
                                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Limite
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
