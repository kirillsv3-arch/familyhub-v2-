'use client';

import { FinanceHistory } from '@/types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

interface ShoppingStatsProps {
  history: FinanceHistory[];
}

export function ShoppingStats({ history }: ShoppingStatsProps) {
  const chartData = useMemo(() => {
    const weeks: { name: string; amount: number; isCurrent: boolean }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i * 7 + now.getDay() - 1));
      start.setHours(0,0,0,0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);

      const amount = history
        .filter(h => h.type === 'shopping' && new Date(h.date as string) >= start && new Date(h.date as string) <= end)
        .reduce((acc, h) => acc + h.amount, 0);

      weeks.push({
        name: `${start.getDate()}.${start.getMonth() + 1}`,
        amount,
        isCurrent: i === 0
      });
    }
    return weeks;
  }, [history]);

  const totalThisMonth = chartData.reduce((acc, w) => acc + w.amount, 0);
  const avgPerMonth = totalThisMonth; // Simplified for this view

  if (totalThisMonth === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Траты на дом</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{avgPerMonth.toLocaleString('ru-RU')}</span>
            <span className="text-lg font-bold text-zinc-400">₽</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">В среднем за 4 недели</p>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="amount" radius={[8, 8, 8, 8]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrent ? '#8B5CF6' : '#E4E4E7'}
                  className={entry.isCurrent ? 'opacity-100' : 'dark:opacity-20'}
                />
              ))}
            </Bar>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }}
              dy={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
