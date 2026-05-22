"use client";

import { useState } from "react";
import { FinanceEvent, FinanceEventType } from "@/types";
import { X, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddFinanceEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<FinanceEvent>) => void;
}

const PRESETS: { type: FinanceEventType; label: string; color: string }[] = [
  { type: 'income', label: 'Приход', color: 'bg-emerald-500' },
  { type: 'expense', label: 'Расход', color: 'bg-zinc-500' },
  { type: 'subscription', label: 'Подписка', color: 'bg-brand-violet' },
  { type: 'purchase', label: 'Закупка', color: 'bg-amber-500' },
];

export default function AddFinanceEventSheet({ isOpen, onClose, onAdd }: AddFinanceEventSheetProps) {
  const [type, setType] = useState<FinanceEventType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dateType, setDateType] = useState<'dayOfMonth' | 'dayOfWeek'>('dayOfMonth');
  const [dateValue, setDateValue] = useState(new Date().getDate());
  const [repeatMonthly, setRepeatMonthly] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      type,
      amount: type === 'purchase' ? 0 : Number(amount),
      dateType,
      dateValue: Number(dateValue),
      repeatMonthly,
    });
    // Reset and close
    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-950 rounded-t-[3rem] z-50 p-8 pt-6"
          >
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Добавить</h3>
              <button onClick={onClose} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => setType(preset.type)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      type === preset.type
                        ? `border-zinc-900 dark:border-white ${preset.color} text-white`
                        : 'border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <span className="font-bold">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500">Название</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Напр. Зарплата или Netflix"
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-brand-emerald"
                  />
                </div>

                {type !== 'purchase' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Сумма (₽)</label>
                    <input
                      required
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl p-4 font-bold text-2xl focus:ring-2 ring-brand-emerald"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 leading-tight">
                      Сумму запишем после закупки
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Периодичность</label>
                    <select
                      value={dateType}
                      onChange={(e) => setDateType(e.target.value as 'dayOfMonth' | 'dayOfWeek')}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl p-4 font-bold appearance-none focus:ring-2 ring-brand-emerald"
                    >
                      <option value="dayOfMonth">Число месяца</option>
                      <option value="dayOfWeek">День недели</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Значение</label>
                    <input
                      required
                      type="number"
                      min={dateType === 'dayOfMonth' ? 1 : 0}
                      max={dateType === 'dayOfMonth' ? 31 : 6}
                      value={dateValue}
                      onChange={(e) => setDateValue(Number(e.target.value))}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-brand-emerald"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatMonthly}
                    onChange={(e) => setRepeatMonthly(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-2 border-zinc-200 dark:border-zinc-800 text-brand-emerald focus:ring-brand-emerald"
                  />
                  <span className="font-bold">Повторять ежемесячно</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white p-5 rounded-[2rem] font-black text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                Добавить
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
