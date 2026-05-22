'use client';

import { SavingGoal } from '@/types';
import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from './DepositModal';

interface SavingsGalleryProps {
  goals: SavingGoal[];
  onRefresh: () => void;
}

export function SavingsGallery({ goals, onRefresh }: SavingsGalleryProps) {
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
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
    <>
      <div className={isGallery ? "flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide" : "space-y-4"}>
        {goals.map((goal) => (
          <SavingGoalCard key={goal.id} goal={goal} isCompact={isGallery} onDeposit={() => setSelectedGoal(goal)} />
        ))}
      </div>

      {selectedGoal && (
        <DepositModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSuccess={() => {
            onRefresh();
            setSelectedGoal(null);
          }}
        />
      )}
    </>
  );
}

function SavingGoalCard({ goal, isCompact, onDeposit }: { goal: SavingGoal, isCompact: boolean, onDeposit: () => void }) {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex-shrink-0 transition-all ${isCompact ? 'w-[300px]' : 'w-full'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="min-w-0">
          <h3 className="font-black text-2xl leading-tight mb-1 truncate">{goal.name}</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-brand-violet font-black text-lg">{goal.currentAmount.toLocaleString('ru-RU')}</span>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">из {goal.targetAmount.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
        <button
          onClick={onDeposit}
          className="w-12 h-12 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-violet/20 active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="h-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-full p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-brand-violet to-violet-400 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          />
        </div>

        <div className="flex justify-between items-center">
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{Math.round(progress)}% собрано</span>
           {goal.deadline && (
             <p className="text-[10px] font-black text-brand-emerald uppercase tracking-widest bg-brand-emerald/5 px-2 py-1 rounded-lg">
               По {Math.ceil((goal.targetAmount - goal.currentAmount) / 2).toLocaleString('ru-RU')} ₽ / мес
             </p>
           )}
        </div>
      </div>
    </motion.div>
  );
}
