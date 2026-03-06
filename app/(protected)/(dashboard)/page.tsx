"use client";

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Wallet, PiggyBank, Eye, EyeOff, Landmark, ReceiptText } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { CategoryChart } from '@/components/finance/category-chart';
import { MonthComparison } from '@/components/finance/month-comparison';
import { SubscriptionStatus } from '@/components/finance/subscription-status';
import { Button } from '@/components/ui/button';
import { getDashboardDataAction } from "@/server/actions/finance-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const dashboardData = await getDashboardDataAction();
                setData(dashboardData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const formatCurrency = (value: number) => {
        if (isPrivate) {
            return 'R$ ••••••';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    if (isLoading) {
        return (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
    }

    if (!data) return null;

    return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <SubscriptionStatus />
      
      <PageHeader 
        title="Dashboard" 
        actions={
          <Button
            variant="outline"
            onClick={() => setIsPrivate(!isPrivate)}
            className="w-full sm:w-auto"
            title={isPrivate ? "Mostrar valores" : "Ocultar valores"}
          >
            {isPrivate ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Oculto
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Visível
              </>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(data.totalDespesasMes)}
          icon={TrendingDown}
          trend="negative"
        />
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(data.totalReceitasMes)}
          icon={TrendingUp}
          trend="positive"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(data.saldoMes)}
          icon={Wallet}
          trend={data.saldoMes >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Saldo Anual"
          value={formatCurrency(data.saldoAnual)}
          icon={PiggyBank}
          trend={data.saldoAnual >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Investido"
          value={formatCurrency(data.totalInvestido)}
          icon={Landmark}
          trend="positive"
        />
      </div>

      <CategoryChart
        expenses={data.gastosPorCategoria}
        incomes={data.receitasPorCategoria}
        totalIncome={data.totalReceitasMes}
        totalExpense={data.totalDespesasMes}
      />

      <MonthComparison
        previousMonth={{
            month: data.mesAnteriorData.mes,
            monthName: data.mesAnteriorData.mesNome,
            total: data.mesAnteriorData.total
        }}
        currentMonth={{
            month: data.mesAtualData.mes,
            monthName: data.mesAtualData.mesNome,
            total: data.mesAtualData.total
        }}
        nextMonth={{
            month: data.mesSeguinteData.mes,
            monthName: data.mesSeguinteData.mesNome,
            total: data.mesSeguinteData.total
        }}
        isPrivate={isPrivate}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Últimas Transações</h3>
        {data.ultimasTransacoes.length > 0 ? (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ultimasTransacoes.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {(() => {
                        const [year, month, day] = t.data.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                      })()}
                    </TableCell>
                    <TableCell>{t.descricao}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{t.categoria}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      t.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(Number(t.valor))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState 
            icon={ReceiptText} 
            title="Nenhuma transação" 
            description="Você ainda não tem transações recentes neste período." 
          />
        )}
      </div>
    </div>
  );
}
