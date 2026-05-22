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
        const dValue = Array.isArray(e.dateValue) ? e.dateValue : [e.dateValue];
        if (e.dateType === 'dayOfMonth') {
          return acc + (e.amount || 0) * dValue.length;
        }
        if (e.dateType === 'dayOfWeek') {
          return acc + (e.amount || 0) * 4;
        }
        return acc;
      }, 0);

    // 2. Mandatory expenses & subscriptions this month
    const mandatoryExpenses = events
      .filter(e => e.type === 'expense' || e.type === 'subscription')
      .reduce((acc, e) => {
        const dValue = Array.isArray(e.dateValue) ? e.dateValue : [e.dateValue];
        if (e.dateType === 'dayOfMonth') {
          return acc + (e.amount || 0) * dValue.length;
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

    const result = monthlyIncome - mandatoryExpenses - actualShopping;
    return isNaN(result) ? 0 : result;
  }, [events, history]);

  const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const currentMonthName = monthNamesGenitive[new Date().getMonth()];

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const monthProgress = (dayOfMonth / daysInMonth) * 100;

  return (
    <div className="bg-zinc-900 dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl shadow-brand-violet/20 relative overflow-hidden text-white">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
           <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Свободные деньги</span>
           </div>
           <Wallet className="w-6 h-6 text-brand-violet" />
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-black tracking-tighter leading-none">{(freeMoney || 0).toLocaleString('ru-RU')}</span>
          <span className="text-2xl font-bold text-white/30">₽</span>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full mt-8 overflow-hidden">
           <div
             className="h-full bg-brand-violet rounded-full transition-all duration-1000"
             style={{ width: `${monthProgress}%` }}
           />
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            До конца {currentMonthName}
          </p>
          <p className="text-xs text-white/80 font-black">
            {Math.max(0, Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ДНЕЙ
          </p>
        </div>
      </div>

      {/* Modern mesh gradient background */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px]" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-emerald/10 rounded-full blur-[80px]" />
    </div>
  );
}
