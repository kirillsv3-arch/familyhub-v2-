'use client';

import { SavingGoal } from '@/types';
import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';

interface SavingsGalleryProps {
  goals: SavingGoal[];
  onRefresh: () => void;
}

export function SavingsGallery({ goals, onRefresh }: SavingsGalleryProps) {
  const isGallery = goals.length > 2;

  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
          <Target className="w-6 h-6 text-zinc-300" />
        </div>
        <p className="font-bold text-zinc-400">Пока нет целей для накоплений</p>
      </div>
    );
  }

  return (
    <div className={isGallery ? "flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide" : "space-y-4"}>
      {goals.map((goal) => (
        <SavingGoalCard key={goal.id} goal={goal} isCompact={isGallery} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

function SavingGoalCard({ goal, isCompact, onRefresh }: { goal: SavingGoal, isCompact: boolean, onRefresh: () => void }) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

  const handleDeposit = async () => {
    const amountStr = prompt('Сколько хотите отложить?');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const res = await fetch(`/api/finance/savings/${goal.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm flex-shrink-0 ${isCompact ? 'w-[280px]' : 'w-full'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-xl leading-tight mb-1">{goal.name}</h3>
          <p className="text-zinc-500 font-bold text-sm">
            {goal.currentAmount.toLocaleString('ru-RU')} / {goal.targetAmount.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <button
          onClick={handleDeposit}
          className="w-10 h-10 bg-brand-violet/10 text-brand-violet rounded-xl flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-brand-violet"
          />
        </div>

        {goal.deadline && (
          <p className="text-[11px] font-bold text-brand-violet uppercase bg-brand-violet/5 px-3 py-1 rounded-lg w-fit">
            Нужно {Math.ceil((goal.targetAmount - goal.currentAmount) / 2).toLocaleString('ru-RU')} ₽ в месяц
          </p>
        )}
      </div>
    </motion.div>
  );
}
