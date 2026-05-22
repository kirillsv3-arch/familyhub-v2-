'use client';

import { useState, useEffect, useMemo } from 'react';
import { PriceHistory } from '@/types';
import { ChevronLeft, TrendingUp, ShoppingBag } from 'lucide-react';
import { StatsSkeleton } from '@/components/shopping/Skeletons';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StatsPage() {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/shopping/stats');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, PriceHistory[]> = {};
    history.forEach(h => {
      if (!groups[h.name]) groups[h.name] = [];
      groups[h.name].push(h);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [history]);

  const chartData = useMemo(() => {
    if (!selectedItem) return [];
    const itemHistory = history
      .filter(h => h.name === selectedItem)
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

    return itemHistory.map(h => ({
      date: new Date(h.date as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      price: h.price,
      store: h.store,
    }));
  }, [selectedItem, history]);

  return (
    <main className="min-h-screen pb-20">
      <div className="flex items-center gap-4 p-6">
        <Link href="/shopping" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Статистика цен</h1>
      </div>

      <div className="px-6 space-y-6">
        {loading ? (
          <StatsSkeleton />
        ) : selectedItem ? (
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedItem}</h2>
                  <p className="text-sm text-zinc-500">История изменений цен</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-sm font-bold text-brand-violet"
                >
                  Все товары
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#A1A1AA' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#A1A1AA' }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-zinc-500 text-sm uppercase px-2">История покупок</h3>
              {history
                .filter(h => h.name === selectedItem)
                .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
                .map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{h.store}</p>
                        <p className="text-xs text-zinc-500">{new Date(h.date as string).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                    <p className="font-bold text-brand-emerald">{h.price} ₽</p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-10 text-zinc-500">Загрузка...</p>
            ) : groupedItems.length > 0 ? (
              groupedItems.map(([name, itemHistory]) => {
                const lastPrice = itemHistory.sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0].price;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedItem(name)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left hover:border-brand-violet transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-brand-violet" />
                      </div>
                      <div>
                        <p className="font-bold">{name}</p>
                        <p className="text-xs text-zinc-500">{itemHistory.length} покупок</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-emerald">{lastPrice} ₽</p>
                      <p className="text-[10px] text-zinc-400 uppercase">Последняя цена</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-20 text-zinc-500">
                <p>История покупок пуста</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
