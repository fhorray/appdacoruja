"use client";

import { useState } from 'react';
import { Target, Save } from 'lucide-react';
import { useFinance } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface LimitsClientProps {
    initialLimits: any[];
    userId: string;
}

export function LimitsClient({ initialLimits, userId }: LimitsClientProps) {
    const { categoriesQuery, categoryLimitsQuery, upsertCategoryLimit } = useFinance(userId);
    const categories = categoriesQuery.data || [];
    const limits = categoryLimitsQuery.data || initialLimits;

    // We need to merge categories with limits
    // Limits table has: category, monthly_limit, annual_limit
    // We want to show input for each category.

    const [localLimits, setLocalLimits] = useState<Record<string, { monthly: number, annual: number }>>(() => {
        const map: Record<string, { monthly: number, annual: number }> = {};
        limits.forEach((l: any) => {
            map[l.category] = { monthly: Number(l.monthlyLimit), annual: Number(l.annualLimit) };
        });
        return map;
    });

    const handleLimitChange = (category: string, type: 'monthly' | 'annual', value: string) => {
        setLocalLimits(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
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
            alert('Limite salvo com sucesso!');
        } catch (error) {
            alert('Erro ao salvar limite.');
        }
    };

    const expenseCategories = categories.filter(c => c.type === 'expense' && c.isActive);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Limites de Gastos</h2>
                    <p className="text-gray-600">Defina metas de gastos por categoria</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenseCategories.map(cat => {
                    const current = localLimits[cat.name] || { monthly: 0, annual: 0 };
                    return (
                        <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{cat.name}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite Mensal</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                                        <Input
                                            type="number"
                                            value={current.monthly}
                                            onChange={(e) => handleLimitChange(cat.name, 'monthly', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite Anual</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                                        <Input
                                            type="number"
                                            value={current.annual}
                                            onChange={(e) => handleLimitChange(cat.name, 'annual', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSave(cat.name)}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {expenseCategories.length === 0 && (
                <p className="text-gray-500">Nenhuma categoria de despesa cadastrada.</p>
            )}
        </div>
    );
}
