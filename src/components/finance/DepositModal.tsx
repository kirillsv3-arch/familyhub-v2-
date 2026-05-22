'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { SavingGoal } from '@/types';

interface DepositModalProps {
  goal: SavingGoal;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepositModal({ goal, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const res = await fetch(`/api/finance/savings/${goal.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-brand-violet/10 rounded-3xl flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-brand-violet" />
          </div>
          <h2 className="text-2xl font-black mb-1">Пополнить копилку</h2>
          <p className="text-zinc-500 font-medium">«{goal.name}»</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="relative">
            <input
              autoFocus
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl p-6 text-4xl font-black text-center placeholder:text-zinc-200 focus:ring-2 focus:ring-brand-violet/20"
            />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-300">₽</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-zinc-400 font-black uppercase text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-[2] bg-brand-violet text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-brand-violet/25 active:scale-95 transition-transform"
            >
              Пополнить
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
