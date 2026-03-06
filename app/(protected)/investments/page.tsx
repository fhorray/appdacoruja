"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Landmark, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { upsertRetirementConfigAction, getRetirementConfigAction, getFinancialProjectsAction } from '@/server/actions/investment-actions';
import { getTransactionsAction } from "@/server/actions/finance-actions";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/hooks/use-auth';

export default function InvestmentsPage() {
    const { user } = useAuth();
    const userId = user?.id as string;

    const [config, setConfig] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [totalInvestido, setTotalInvestido] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!userId) return;
            try {
                const [retirementConfig, financialProjects, transactions] = await Promise.all([
                    getRetirementConfigAction(userId),
                    getFinancialProjectsAction(userId),
                    getTransactionsAction() // Calls server action seamlessly
                ]);

                setConfig(retirementConfig || {
                    currentAge: 30,
                    retirementAge: 65,
                    desiredMonthlyIncome: 10000,
                    otherFutureIncomes: 0,
                    monthlyInvestment: 1000,
                    accumulationRate: 10,
                    retirementRate: 6,
                });
                setProjects(financialProjects || []);

                const calcTotal = transactions
                    ?.filter((t: any) => t.category?.toLowerCase().includes('investimento'))
                    .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
                setTotalInvestido(calcTotal);
            } catch (error) {
                console.error("Failed to load investments", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [userId]);

    const upsertConfig = useMutation({
        mutationFn: upsertRetirementConfigAction,
        onSuccess: () => {
            // Success handler if needed (e.g., toast)
        }
    });

    const handleConfigChange = (key: string, value: number) => {
        setConfig({ ...config, [key]: value });
    };

    const handleSaveConfig = () => {
        upsertConfig.mutate({ userId, data: config });
    };

    if (isLoading) {
        return (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
    }

    if (!config) return null;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader 
                title="Investimentos" 
                actions={
                    <Button
                        onClick={handleSaveConfig}
                        disabled={upsertConfig.isPending}
                        className="w-full sm:w-auto"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {upsertConfig.isPending ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-4">
                <StatCard
                    title="Total Investido Real"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvestido)}
                    icon={Landmark}
                    trend="positive"
                    className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 border-none shadow-lg [&_div]:text-blue-100 [&_h3]:text-white [&_svg]:text-white [&_p]:text-white"
                />
            </div>

            <Tabs defaultValue="retirement" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="retirement">
                        <TrendingUp className="w-4 h-4 mr-2 hidden sm:inline-block" />
                        Aposentadoria
                    </TabsTrigger>
                    <TabsTrigger value="projects">
                        <Target className="w-4 h-4 mr-2 hidden sm:inline-block" />
                        Projetos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="retirement" className="mt-6">
                    <div className="p-6 bg-card rounded-xl shadow-sm border space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Configurações de Simulação</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <Label>Idade Atual</Label>
                                <Input type="number" value={config.currentAge} onChange={e => handleConfigChange('currentAge', +e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Idade Aposentadoria</Label>
                                <Input type="number" value={config.retirementAge} onChange={e => handleConfigChange('retirementAge', +e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Renda Desejada</Label>
                                <Input type="number" value={config.desiredMonthlyIncome} onChange={e => handleConfigChange('desiredMonthlyIncome', +e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Aporte Mensal Simulado</Label>
                                <Input type="number" value={config.monthlyInvestment} onChange={e => handleConfigChange('monthlyInvestment', +e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Taxa Acumulação (%) a.a</Label>
                                <Input type="number" step="0.1" value={config.accumulationRate} onChange={e => handleConfigChange('accumulationRate', +e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Taxa Aposentadoria (%) a.a</Label>
                                <Input type="number" step="0.1" value={config.retirementRate} onChange={e => handleConfigChange('retirementRate', +e.target.value)} />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                    <div className="p-6 bg-card rounded-xl shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Projetos Financeiros (Em breve)</h3>
                        <p className="text-muted-foreground">O módulo de projetos financeiros será reativado na próxima atualização.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
