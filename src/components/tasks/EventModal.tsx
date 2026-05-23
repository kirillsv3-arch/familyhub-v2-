'use client';

import { useState } from 'react';
import { FamilyEvent } from '@/types';
import { X, Calendar as CalendarIcon, Heart, Gift, Star, LucideIcon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<FamilyEvent>) => void;
  selectedDate: Date;
}

const EVENT_TYPES: { id: FamilyEvent['type']; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'holiday', label: 'Праздник', icon: Star, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'birthday', label: 'ДР', icon: Gift, color: 'text-brand-violet bg-brand-violet/10' },
  { id: 'anniversary', label: 'Годовщина', icon: Heart, color: 'text-red-500 bg-red-500/10' },
  { id: 'other', label: 'Другое', icon: CalendarIcon, color: 'text-zinc-500 bg-zinc-500/10' },
];

export function EventModal({ isOpen, onClose, onSave, selectedDate }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<FamilyEvent['type']>('holiday');
  const [isRecurring, setIsRecurring] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return;
    onSave({
      title,
      type,
      isRecurring,
      date: selectedDate.toISOString(),
    });
    setTitle('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Новое событие</h2>
            <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-zinc-400" />
                <span className="font-bold">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Что празднуем?</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-violet outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Тип события</label>
              <div className="grid grid-cols-2 gap-3">
                {EVENT_TYPES.map((et) => {
                  const Icon = et.icon;
                  return (
                    <button
                      key={et.id}
                      onClick={() => setType(et.id)}
                      className={cn(
                        "p-4 rounded-2xl border font-bold text-sm flex flex-col items-center gap-2 transition-all",
                        type === et.id
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg"
                          : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-100 dark:border-zinc-700"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl", type === et.id ? "bg-white/20 dark:bg-zinc-900/20" : et.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {et.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border font-bold text-sm transition-all",
                    isRecurring ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                )}
            >
                <div className="flex items-center gap-2">
                    <RefreshCw className={cn("w-4 h-4", isRecurring && "animate-spin-slow")} />
                    Повторять каждый год
                </div>
                <div className={cn("w-10 h-6 rounded-full relative transition-colors", isRecurring ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-600")}>
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isRecurring ? "left-5" : "left-1")} />
                </div>
            </button>

            <button
              onClick={handleSave}
              className="w-full py-5 bg-brand-violet text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-violet/20 active:scale-[0.98] transition-all"
            >
              Создать событие
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
