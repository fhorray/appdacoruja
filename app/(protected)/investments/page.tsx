"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Landmark, Save, Plus, MoreVertical, Trash2, Edit2, Calendar, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertRetirementConfigAction, getRetirementConfigAction, getFinancialProjectsAction, deleteFinancialProjectAction } from '@/server/actions/investment-actions';
import { getTransactionsAction } from "@/server/actions/finance-actions";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/hooks/use-auth';
import { useInvestments } from '@/hooks/use-investments';
import { FinancialProjectFormSheet } from '@/components/finance/financial-project-form-sheet';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function InvestmentsPage() {
    const { user } = useAuth();
    const userId = user?.id as string;
    const queryClient = useQueryClient();

    const { 
        retirementConfigQuery, 
        upsertRetirementConfig, 
        financialProjectsQuery,
        deleteFinancialProject 
    } = useInvestments(userId);

    const [config, setConfig] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [totalInvestido, setTotalInvestido] = useState(0);

    // Initial load for transactions (StatCard)
    useEffect(() => {
        async function loadDashboardStats() {
            try {
                const transactions = await getTransactionsAction();
                const calcTotal = transactions
                    ?.filter((t: any) => t.category?.toLowerCase().includes('investimento'))
                    .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
                setTotalInvestido(calcTotal);
            } catch (error) {
                console.error("Failed to load investment stats", error);
            }
        }
        loadDashboardStats();
    }, []);

    // Sync local state with retirement config query
    useEffect(() => {
        if (retirementConfigQuery.data) {
            setConfig(retirementConfigQuery.data);
        } else if (!retirementConfigQuery.isLoading) {
            setConfig({
                currentAge: 30,
                retirementAge: 65,
                desiredMonthlyIncome: 10000,
                otherFutureIncomes: 0,
                monthlyInvestment: 1000,
                accumulationRate: 10,
                retirementRate: 6,
            });
        }
    }, [retirementConfigQuery.data, retirementConfigQuery.isLoading]);

    const handleConfigChange = (key: string, value: number) => {
        setConfig({ ...config, [key]: value });
    };

    const handleSaveConfig = () => {
        upsertRetirementConfig.mutate(config, {
            onSuccess: () => toast.success("Configurações salvas!")
        });
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
        try {
            await deleteFinancialProject.mutateAsync(id);
            toast.success("Projeto excluído!");
            queryClient.invalidateQueries({ queryKey: ['financial-projects'] });
        } catch (error) {
            toast.error("Erro ao excluir projeto");
        }
    };

    if (retirementConfigQuery.isLoading || financialProjectsQuery.isLoading) {
        return (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
    }

    const projects = financialProjectsQuery.data || [];

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader 
                title="Investimentos" 
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedProject(null);
                                setIsFormOpen(true);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Projeto
                        </Button>
                        <Button
                            onClick={handleSaveConfig}
                            disabled={upsertRetirementConfig.isPending}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {upsertRetirementConfig.isPending ? 'Salvando...' : 'Salvar Simulação'}
                        </Button>
                    </div>
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
                        {config && (
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
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.length === 0 ? (
                            <div className="col-span-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="bg-primary/5 p-4 rounded-full">
                                    <Target className="w-8 h-8 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Nenhum projeto ainda</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                        Clique em "Novo Projeto" para começar a planejar suas grandes conquistas.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedProject(null);
                                        setIsFormOpen(true);
                                    }}
                                    className="rounded-xl"
                                >
                                    Começar meu primeiro projeto
                                </Button>
                            </div>
                        ) : (
                            projects.map((project: any) => {
                                const progress = Math.min((project.accumulatedValue / project.targetValue) * 100, 100);
                                return (
                                    <div key={project.id} className="bg-card rounded-2xl border shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedProject(project);
                                                        setIsFormOpen(true);
                                                    }}>
                                                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-foreground truncate">{project.name}</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(project.targetDate).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progresso</span>
                                                <span className="font-medium">{progress.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                            <div className="flex justify-between text-[11px] font-medium pt-1">
                                                <span className="text-primary truncate">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.accumulatedValue)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    meta {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.targetValue)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                                <TrendingUp className="w-3 h-3" />
                                                {project.estimatedYield}% a.a
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold group-hover:bg-primary/5 text-primary">
                                                Detalhes <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <FinancialProjectFormSheet
                userId={userId}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedProject(null);
                }}
                initialData={selectedProject}
            />
        </div>
    );
}
