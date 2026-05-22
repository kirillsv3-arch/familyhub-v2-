'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank, Calendar, ArrowRight } from 'lucide-react';
import { SavingGoal } from '@/types';

interface SavingGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; targetAmount: number; desiredDate?: string }) => Promise<void>;
  initialTitle?: string;
  initialAmount?: number;
  existingGoal?: SavingGoal;
}

export function SavingGoalModal({ isOpen, onClose, onCreate, initialTitle = '', initialAmount = 0, existingGoal }: SavingGoalModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState(initialAmount.toString());
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        title,
        targetAmount: parseFloat(amount),
        desiredDate: date || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progress = existingGoal ? (existingGoal.currentAmount / existingGoal.targetAmount) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-950 rounded-t-[32px] z-[111] shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{existingGoal ? 'Копилка на желание' : 'Создать копилку'}</h2>
                <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {existingGoal ? (
                <div className="space-y-6 pb-8">
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Собрано</p>
                        <p className="text-2xl font-bold">{existingGoal.currentAmount} ₽ <span className="text-zinc-400 text-lg">/ {existingGoal.targetAmount} ₽</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brand-violet">{Math.round(progress)}%</p>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, progress)}%` }}
                        className="h-full bg-brand-violet"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        // In a real app, this would navigate to the Money section
                        alert('Переход в раздел "Деньги"');
                        onClose();
                    }}
                    className="w-full py-4 bg-brand-violet text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Перейти в раздел Деньги
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 ml-1">Название копилки</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 ml-1">Целевая сумма (₽)</label>
                    <div className="relative">
                      <PiggyBank className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-4 pl-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 ml-1">Желаемая дата (опционально)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-4 pl-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !title || !amount}
                    className="w-full py-4 bg-brand-violet text-white font-bold rounded-2xl disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading ? 'Создание...' : 'Создать копилку'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
