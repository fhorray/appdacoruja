"use client";

import { useState } from 'react';
import { TrendingDown, TrendingUp, Wallet, PiggyBank, Eye, EyeOff, Landmark } from 'lucide-react';
import { Card } from '@/components/finance/card';
import { CategoryChart } from '@/components/finance/category-chart';
import { MonthComparison } from '@/components/finance/month-comparison';
import { SubscriptionStatus } from '@/components/finance/subscription-status';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  initialData: any;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    const router = useRouter();
    const [data] = useState(initialData);
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

    return (
    <div className="space-y-6">
      <SubscriptionStatus />
      
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-4xl font-bold text-gray-900">Dashboard</h2>
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg ${
            isPrivate
              ? 'bg-gray-700 hover:bg-gray-800 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
          }`}
          title={isPrivate ? "Mostrar valores" : "Ocultar valores"}
        >
          {isPrivate ? (
            <>
              <EyeOff className="w-5 h-5" />
              <span className="text-sm font-bold">Oculto</span>
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              <span className="text-sm font-bold">Visível</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card
          title="Despesas do Mes"
          value={formatCurrency(data.totalDespesasMes)}
          icon={TrendingDown}
          trend="negative"
        />
        <Card
          title="Receitas do Mes"
          value={formatCurrency(data.totalReceitasMes)}
          icon={TrendingUp}
          trend="positive"
        />
        <Card
          title="Saldo do Mes"
          value={formatCurrency(data.saldoMes)}
          icon={Wallet}
          trend={data.saldoMes >= 0 ? 'positive' : 'negative'}
        />
        <Card
          title="Saldo Anual"
          value={formatCurrency(data.saldoAnual)}
          icon={PiggyBank}
          trend={data.saldoAnual >= 0 ? 'positive' : 'negative'}
        />
        <Card
          title="Total Investido"
          value={formatCurrency(data.totalInvestido)}
          icon={Landmark}
          trend="positive"
        />
      </div>

      {/* Adjust data prop names to match server response structure */}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Transações</h3>
        {data.ultimasTransacoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimasTransacoes.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {(() => {
                        const [year, month, day] = t.data.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{t.descricao}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{t.categoria}</td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${
                      t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(Number(t.valor))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
        )}
      </div>
    </div>
  );
}
