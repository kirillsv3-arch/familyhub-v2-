'use client';

import { FinanceEvent, FinanceHistory, User } from '@/types';
import { Wallet } from 'lucide-react';
import { useMemo } from 'react';

interface FreeMoneyCounterProps {
  events: FinanceEvent[];
  history: FinanceHistory[];
  currentUser: User;
}

export function FreeMoneyCounter({ events, history }: FreeMoneyCounterProps) {
  const freeMoney = useMemo(() => {
    const now = new Date();

    // 1. Total expected income this month
    const monthlyIncome = events
      .filter(e => e.type === 'income')
      .reduce((acc, e) => {
        if (e.dateType === 'dayOfMonth') {
          return acc + (e.amount || 0) * e.dateValue.length;
        }
        // Simplified for weekly: average 4 weeks
        if (e.dateType === 'dayOfWeek') {
          return acc + (e.amount || 0) * 4;
        }
        return acc;
      }, 0);

    // 2. Mandatory expenses & subscriptions this month
    const mandatoryExpenses = events
      .filter(e => e.type === 'expense' || e.type === 'subscription')
      .reduce((acc, e) => {
        if (e.dateType === 'dayOfMonth') {
          return acc + (e.amount || 0) * e.dateValue.length;
        }
        if (e.dateType === 'dayOfWeek') {
          return acc + (e.amount || 0) * 4;
        }
        return acc;
      }, 0);

    // 3. Actual shopping expenses this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actualShopping = history
      .filter(h => h.type === 'shopping' && new Date(h.date as string) >= startOfMonth)
      .reduce((acc, h) => acc + h.amount, 0);

    return monthlyIncome - mandatoryExpenses - actualShopping;
  }, [events, history]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-brand-violet" />
          </div>
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Свободные деньги</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black">{freeMoney.toLocaleString('ru-RU')}</span>
          <span className="text-2xl font-bold text-zinc-400">₽</span>
        </div>

        <p className="mt-4 text-sm text-zinc-400 font-medium">
          До конца {new Date().toLocaleString('ru-RU', { month: 'long' })} осталось {
            Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          } дней
        </p>
      </div>

      {/* Decorative blobs */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-violet/5 rounded-full blur-3xl" />
      <div className="absolute -right-4 top-4 w-20 h-20 bg-brand-emerald/5 rounded-full blur-2xl" />
    </div>
  );
}
