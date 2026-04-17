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
import { SavingsGoalsDashboardWidget } from '@/components/finance/savings-goals-dashboard-widget';
import { BudgetAlertsWidget } from '@/components/finance/budget-alerts-widget';
import { CommittedSalaryWidget } from '@/components/finance/committed-salary-widget';
import { InsightsWidget } from '@/components/finance/insights-widget';
import { CreditCardWidget } from '@/components/finance/credit-card-widget';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard';
import { PerformanceChart } from '@/components/finance/performance-chart';
import { TransactionFormModal } from '@/components/finance/transaction-form-sheet';
import { PlusCircle, PlusCircleIcon, DollarSign, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const { data, isLoading } = useDashboardData();
    const [isPrivate, setIsPrivate] = useState(false);

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
        balance={data.monthlyBalance} 
        income={data.totalMonthlyIncome} 
        expenses={data.totalMonthlyExpenses} 
        formatCurrency={formatCurrency} 
      />

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <TransactionFormModal mode="create" userId={user?.id as string} initialData={{ type: 'income' }}>
           <Button variant="outline" className="h-16 rounded-2xl bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 text-emerald-700 flex flex-col items-center justify-center gap-1">
             <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                <PlusCircle className="w-4 h-4" />
                Receita
             </div>
             <span className="text-[9px] font-medium opacity-70">Adicionar entrada</span>
           </Button>
        </TransactionFormModal>

        <TransactionFormModal mode="create" userId={user?.id as string} initialData={{ type: 'expense' }}>
           <Button variant="outline" className="h-16 rounded-2xl bg-red-50/50 border-red-100 hover:bg-red-50 hover:border-red-200 text-red-700 flex flex-col items-center justify-center gap-1">
             <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                <PlusCircle className="w-4 h-4" />
                Despesa
             </div>
             <span className="text-[9px] font-medium opacity-70">Adicionar custo</span>
           </Button>
        </TransactionFormModal>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Saldo Anual"
          value={formatCurrency(data.yearlyBalance)}
          icon={PiggyBank}
          trend={data.yearlyBalance >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Investido"
          value={formatCurrency(data.totalInvested)}
          icon={Landmark}
          trend="positive"
        />
      </div>

      <BudgetAlertsWidget alerts={data.budgetAlerts || []} />
      <CommittedSalaryWidget 
        totalCommitted={data.committedAmount || 0} 
        totalIncome={data.totalMonthlyIncome || 0}
        upcomingBills={data.upcomingBills || []}
      />
      <InsightsWidget insights={data.insights || []} />
      <CreditCardWidget summary={data.creditCardSummary} />
      <SavingsGoalsDashboardWidget goals={data.topSavingsGoals || []} />

      <PerformanceChart data={data.performanceData || []} />

      <CategoryChart
        expenses={data.spendingByCategory}
        incomes={data.incomeByCategory}
        totalIncome={data.totalMonthlyIncome}
        totalExpense={data.totalMonthlyExpenses}
      />

      <MonthComparison
        previousMonth={{
            month: data.previousMonthData.month,
            monthName: data.previousMonthData.monthName,
            total: data.previousMonthData.total
        }}
        currentMonth={{
            month: data.currentMonthData.month,
            monthName: data.currentMonthData.monthName,
            total: data.currentMonthData.total
        }}
        nextMonth={{
            month: data.nextMonthData.month,
            monthName: data.nextMonthData.monthName,
            total: data.nextMonthData.total
        }}
        isPrivate={isPrivate}
      />

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold tracking-tight px-1">Últimas Transações</h3>
        {data.recentTransactions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.recentTransactions.map((t: any) => (
              <TransactionListItem 
                onDelete={()=> {}}
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
