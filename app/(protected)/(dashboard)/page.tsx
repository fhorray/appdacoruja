"use client";

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Wallet, PiggyBank, Eye, EyeOff, Landmark, ReceiptText } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { CategoryChart } from '@/components/finance/category-chart';
import { MonthComparison } from '@/components/finance/month-comparison';
import { SubscriptionStatus } from '@/components/finance/subscription-status';
import { DashboardHeader } from '@/components/finance/dashboard-header';
import { TransactionListItem } from '@/components/finance/transaction-list-item';
import { Button } from '@/components/ui/button';
import { getDashboardDataAction } from "@/server/actions/finance-actions";
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
    const { user } = useAuth();
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
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-10">
      <SubscriptionStatus />
      
      <DashboardHeader
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        saldo={data.saldoMes}
        receitas={data.totalReceitasMes}
        despesas={data.totalDespesasMes}
        formatCurrency={formatCurrency}
      />

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold tracking-tight px-1">Últimas Transações</h3>
        {data.ultimasTransacoes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.ultimasTransacoes.map((t: any) => (
              <TransactionListItem
                key={t.id}
                transaction={t}
                formatCurrency={formatCurrency}
                userId={user?.id as string}
              />
            ))}
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
