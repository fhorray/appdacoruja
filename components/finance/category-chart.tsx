import { useMemo } from 'react';

interface CategoryData {
  category: string;
  total: number;
  percentage: number;
}

interface CategoryChartProps {
  expenses: CategoryData[];
  incomes: CategoryData[];
  totalIncome: number;
  totalExpense: number;
}

const EXPENSE_COLORS = [
  '#0F3560',
  '#1d5f96',
  '#011e3a',
  '#1a4a6d',
  '#2a5f8a',
  '#3b74a7',
  '#F2C21A',
  '#FFE07A',
  '#E2AA2D',
  '#D89B1F',
  '#C88D15',
  '#B87E0C',
];

const INCOME_COLORS = [
  '#5ED6B3',
  '#9EF2D3',
  '#CFF8EB',
  '#47CAA5',
  '#7EDEC5',
  '#A8F5DC',
  '#3DC099',
  '#66D9B8',
  '#8FE8CC',
  '#2AB588',
  '#4ECDA8',
  '#72E4C1',
];

export function CategoryChart({ expenses, incomes, totalIncome, totalExpense }: CategoryChartProps) {
  const expenseColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    expenses.forEach((item, index) => {
      map[item.category] = EXPENSE_COLORS[index % EXPENSE_COLORS.length];
    });
    return map;
  }, [expenses]);

  const incomeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    incomes.forEach((item, index) => {
      map[item.category] = INCOME_COLORS[index % INCOME_COLORS.length];
    });
    return map;
  }, [incomes]);

  const maxValue = Math.max(totalIncome, totalExpense);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const incomesWithValue = incomes.filter(r => r.total > 0);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Distribuição Mensal
      </h3>

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5ED6B3' }}></span>
              Receitas
            </h4>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalIncome)}
            </span>
          </div>

          {incomesWithValue.length > 0 ? (
            <>
              <div
                className="w-full bg-gray-100 rounded-lg h-16 overflow-hidden flex"
                style={{ width: maxValue > 0 ? `${(totalIncome / maxValue) * 100}%` : '0%', minWidth: '100%' }}
              >
                {incomesWithValue.map((item, index) => {
                  const widthPercentage = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
                  const isFirst = index === 0;
                  const isLast = index === incomesWithValue.length - 1;

                  return (
                    <div
                      key={index}
                      className={`h-full flex items-center justify-center text-white font-semibold text-xs transition-all relative group ${
                        isFirst ? 'rounded-l-lg' : ''
                      } ${isLast ? 'rounded-r-lg' : ''}`}
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: incomeColorMap[item.category],
                        minWidth: widthPercentage > 5 ? 'auto' : '2px',
                      }}
                      title={`${item.category}: ${formatCurrency(item.total)} (${(item.percentage || 0).toFixed(1)}%)`}
                    >
                      {widthPercentage > 10 && (
                        <span className="px-2 text-center">
                          {(item.percentage || 0).toFixed(0)}%
                        </span>
                      )}

                      <div className="absolute -bottom-16 left-0 right-0 mx-auto sm:mx-0 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg flex flex-col items-center">
                        <div className="font-semibold">{item.category}</div>
                        <div>{formatCurrency(item.total)}</div>
                        <div className="text-gray-300">{(item.percentage || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {incomes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: incomeColorMap[item.category] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {item.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg">
              Nenhuma receita registrada neste mês
            </div>
          )}
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0F3560' }}></span>
              Despesas por Categoria
            </h4>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalExpense)}
            </span>
          </div>

          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: expenseColorMap[item.category] }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${expenseColorMap[item.category]}15`,
                          color: expenseColorMap[item.category],
                        }}
                      >
                        {(item.percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-lg h-10 overflow-hidden">
                    <div
                      className="h-full flex items-center px-3 text-white font-medium text-sm transition-all"
                      style={{
                        width: maxValue > 0 ? `${(item.total / maxValue) * 100}%` : '0%',
                        backgroundColor: expenseColorMap[item.category],
                        minWidth: item.total > 0 ? '60px' : '0',
                      }}
                    >
                      {item.total > 0 && formatCurrency(item.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg">
              Nenhuma despesa registrada neste mês
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
