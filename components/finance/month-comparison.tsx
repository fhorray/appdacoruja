import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthData {
  month: string;
  monthName: string;
  total: number;
  variation?: number;
  type?: 'increase' | 'decrease' | 'stable';
}

interface MonthComparisonProps {
  previousMonth: MonthData;
  currentMonth: MonthData;
  nextMonth: MonthData;
  isPrivate?: boolean;
}

export function MonthComparison({ previousMonth: prevMonth, currentMonth: currMonth, nextMonth: nxtMonth, isPrivate }: MonthComparisonProps) {
  const formatCurrency = (value: number) => {
    if (isPrivate) {
      return 'R$ ••••••';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, type: 'stable' as const };
    const percentage = ((current - previous) / previous) * 100;

    if (Math.abs(percentage) < 0.1) return { percentage: 0, type: 'stable' as const };
    if (percentage > 0) return { percentage, type: 'increase' as const };
    return { percentage: Math.abs(percentage), type: 'decrease' as const };
  };

  const variationCurrPrev = calculateVariation(currMonth.total, prevMonth.total);
  const variationNextCurr = calculateVariation(nxtMonth.total, currMonth.total);

  const maxValue = Math.max(
    Math.abs(prevMonth.total),
    Math.abs(currMonth.total),
    Math.abs(nxtMonth.total)
  );

  const renderCard = (monthData: MonthData, variation?: { percentage: number; type: 'increase' | 'decrease' | 'stable' }, isHighlight?: boolean) => {
    return (
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all ${isHighlight
          ? 'bg-blue-50 border-blue-500 shadow-md md:scale-105'
          : 'bg-white border-gray-200 shadow-sm'
        }`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className={`text-sm font-medium ${isHighlight ? 'text-blue-700' : 'text-gray-500'}`}>
                {monthData.monthName}
              </p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${isHighlight ? 'text-blue-900' : 'text-gray-900'}`}>
                {formatCurrency(monthData.total)}
              </p>
            </div>
            {variation && variation.type !== 'stable' && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${variation.type === 'increase'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                {variation.type === 'increase' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {variation.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            {variation && variation.type === 'stable' && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                <Minus className="w-4 h-4" />
                <span className="text-sm font-semibold">0%</span>
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${monthData.total >= 0
                  ? (isHighlight ? 'bg-blue-600' : 'bg-green-500')
                  : 'bg-red-500'
                }`}
              style={{ width: maxValue > 0 ? `${(Math.abs(monthData.total) / maxValue) * 100}%` : '0%' }}
            />
          </div>

          {variation && variation.type !== 'stable' && !isPrivate && (
            <p className={`text-xs mt-2 ${variation.type === 'increase'
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
              {variation.type === 'increase' ? 'Melhoria' : 'Piora'} de {formatCurrency(Math.abs(monthData.total - (isHighlight ? prevMonth.total : currMonth.total)))} em relação ao mês {isHighlight ? 'anterior' : 'atual'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Comparação Mensal - Saldo (Receitas - Despesas)</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span>Melhoria</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-600" />
            <span>Piora</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderCard(prevMonth)}
        {renderCard(currMonth, variationCurrPrev, true)}
        {renderCard(nxtMonth, variationNextCurr)}
      </div>

      {!isPrivate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Variação do saldo</p>
              <p className={`font-semibold ${variationCurrPrev.type === 'increase'
                  ? 'text-green-600'
                  : variationCurrPrev.type === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                {variationCurrPrev.type === 'increase' && '+'}
                {variationCurrPrev.type === 'decrease' && '-'}
                {variationCurrPrev.percentage.toFixed(1)}% vs mês anterior
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Projeção próximo mês</p>
              <p className={`font-semibold ${variationNextCurr.type === 'increase'
                  ? 'text-green-600'
                  : variationNextCurr.type === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                {nxtMonth.total > 0
                  ? `${variationNextCurr.type === 'increase' ? '+' : variationNextCurr.type === 'decrease' ? '-' : ''}${variationNextCurr.percentage.toFixed(1)}% vs mês atual`
                  : 'Sem dados'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
