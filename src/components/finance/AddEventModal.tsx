'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User as UserIcon, Calendar as CalendarIcon, Hash } from 'lucide-react';

interface AddEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
  members: { uid: string; name: string }[];
}

export function AddEventModal({ onClose, onSuccess, members }: AddEventModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'subscription' | 'shopping'>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateType, setDateType] = useState<'dayOfMonth' | 'dayOfWeek' | 'nthDayOfWeek'>('dayOfMonth');
  const [dateValue, setDateValue] = useState<number[]>([]);
  const [recurring, setRecurring] = useState(true);
  const [userId, setUserId] = useState('family');
  const [isLoan, setIsLoan] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (type !== 'shopping' && !amount)) return;

    try {
      const res = await fetch('/api/finance/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category: isLoan ? 'loan' : undefined,
          name,
          amount: type === 'shopping' ? null : parseFloat(amount),
          dateType,
          dateValue: dateValue.length > 0 ? dateValue : [new Date().getDate()],
          recurring,
          userId,
          reminderEnabled: true,
          reminderDaysBefore: 2
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

  const toggleDay = (day: number) => {
    if (dateType === 'dayOfMonth') {
      setDateValue(prev =>
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    } else {
      setDateValue([day]);
    }
  };

  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
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
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh] scrollbar-hide"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Новый план</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            {(['income', 'expense', 'subscription', 'shopping'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
                  type === t
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-violet'
                  : 'text-zinc-500'
                }`}
              >
                {t === 'income' ? 'Доход' : t === 'expense' ? 'Расход' : t === 'subscription' ? 'Подписка' : 'Закупка'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название (например, Интернет)"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl p-4 text-lg font-bold placeholder:text-zinc-300 focus:ring-2 focus:ring-brand-violet/20"
            />

            {type !== 'shopping' && (
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl p-4 text-3xl font-black placeholder:text-zinc-200 focus:ring-2 focus:ring-brand-violet/20 pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-300">₽</span>
              </div>
            )}
          </div>

          {type === 'expense' && (
            <button
              type="button"
              onClick={() => setIsLoan(!isLoan)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                isLoan ? 'border-amber-400 bg-amber-400/5 text-amber-600' : 'border-zinc-100 text-zinc-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${isLoan ? 'bg-amber-400 border-amber-400' : 'border-zinc-300'}`} />
              <span className="text-sm font-bold uppercase tracking-tight">Это кредит</span>
            </button>
          )}

          <div className="space-y-4">
             <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDateType('dayOfMonth'); setDateValue([]); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dateType === 'dayOfMonth' ? 'bg-brand-violet text-white' : 'bg-zinc-100 text-zinc-500'}`}
                >Числа месяца</button>
                <button
                  type="button"
                  onClick={() => { setDateType('dayOfWeek'); setDateValue([]); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dateType === 'dayOfWeek' ? 'bg-brand-violet text-white' : 'bg-zinc-100 text-zinc-500'}`}
                >Дни недели</button>
                <button
                  type="button"
                  onClick={() => { setDateType('nthDayOfWeek'); setDateValue([1, 1]); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dateType === 'nthDayOfWeek' ? 'bg-brand-violet text-white' : 'bg-zinc-100 text-zinc-500'}`}
                >Сложные</button>
             </div>

             {dateType === 'dayOfMonth' && (
               <div className="grid grid-cols-7 gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl">
                 {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                   <button
                     key={day}
                     type="button"
                     onClick={() => toggleDay(day)}
                     className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                       dateValue.includes(day) ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/25' : 'bg-white dark:bg-zinc-700 text-zinc-500'
                     }`}
                   >
                     {day}
                   </button>
                 ))}
               </div>
             )}

             {dateType === 'dayOfWeek' && (
               <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl">
                 {[1, 2, 3, 4, 5, 6, 0].map(day => (
                   <button
                     key={day}
                     type="button"
                     onClick={() => toggleDay(day)}
                     className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${
                       dateValue.includes(day) ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/25' : 'bg-white dark:bg-zinc-700 text-zinc-500'
                     }`}
                   >
                     {weekdays[day]}
                   </button>
                 ))}
               </div>
             )}

             {dateType === 'nthDayOfWeek' && (
                <div className="flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center shadow-sm text-brand-violet">
                         <Hash className="w-4 h-4" />
                      </div>
                      <select
                        value={dateValue[0] || 1}
                        onChange={(e) => setDateValue([parseInt(e.target.value), dateValue[1] || 1])}
                        className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0"
                      >
                         <option value="1">Первая</option>
                         <option value="2">Вторая</option>
                         <option value="3">Третья</option>
                         <option value="4">Четвертая</option>
                         <option value="5">Последняя</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center shadow-sm text-brand-violet">
                         <CalendarIcon className="w-4 h-4" />
                      </div>
                      <select
                        value={dateValue[1] || 1}
                        onChange={(e) => setDateValue([dateValue[0] || 1, parseInt(e.target.value)])}
                        className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0"
                      >
                         {[1, 2, 3, 4, 5, 6, 0].map(d => (
                            <option key={d} value={d}>{weekdays[d]}</option>
                         ))}
                      </select>
                   </div>
                </div>
             )}
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center shadow-sm">
                   <UserIcon className="w-5 h-5 text-zinc-400" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase">Кто платит?</p>
                   <select
                     value={userId}
                     onChange={(e) => setUserId(e.target.value)}
                     className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                   >
                     <option value="family">Общее</option>
                     {members.map(m => (
                       <option key={m.uid} value={m.uid}>{m.name}</option>
                     ))}
                   </select>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Повторять регулярно</p>
                  <p className="text-xs text-zinc-400">Событие будет в календаре каждый месяц</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecurring(!recurring)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${recurring ? 'bg-brand-violet' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                >
                  <motion.div
                    animate={{ x: recurring ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-violet text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-brand-violet/25 active:scale-95 transition-transform"
          >
            Добавить в бюджет
          </button>
        </form>
      </motion.div>
    </div>
  );
}
