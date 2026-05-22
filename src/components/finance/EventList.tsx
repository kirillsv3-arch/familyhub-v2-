'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { FinanceEvent } from '@/types';

interface EventListProps {
  events: (FinanceEvent & { date: string; userName?: string })[];
  onShoppingClick: (event: FinanceEvent & { date: string }) => void;
  onRefresh: () => void;
}

export function EventList({ events, onShoppingClick, onRefresh }: EventListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedEvents = showAll ? events : events.slice(0, 3);

  const getIcon = (type: string, category?: string) => {
    if (type === 'income') return <ArrowUpCircle className="w-5 h-5 text-brand-emerald" />;
    if (type === 'subscription') return <CreditCard className="w-5 h-5 text-brand-violet" />;
    if (type === 'shopping') return <ShoppingCart className="w-5 h-5 text-zinc-400" />;
    if (category === 'loan') return <CreditCard className="w-5 h-5 text-amber-400" />;
    return <ArrowDownCircle className="w-5 h-5 text-zinc-400" />;
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Удалить это событие из бюджета?')) return;
    try {
      const res = await fetch(`/api/finance/events/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getBgColor = (type: string, category?: string) => {
    if (type === 'income') return 'bg-brand-emerald/10';
    if (type === 'subscription') return 'bg-brand-violet/10';
    if (type === 'shopping') return 'bg-zinc-100 dark:bg-zinc-800';
    if (category === 'loan') return 'bg-amber-400/10';
    return 'bg-zinc-100 dark:bg-zinc-800';
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode='popLayout'>
        {displayedEvents.map((event) => {
          const date = new Date(event.date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <motion.div
              key={`${event.id}-${event.date}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-4 flex items-center gap-4 border border-zinc-100 dark:border-zinc-800"
              onClick={() => event.type === 'shopping' && onShoppingClick(event)}
            >
              <div className={`w-12 h-12 rounded-2xl ${getBgColor(event.type, event.category)} flex items-center justify-center`}>
                {getIcon(event.type, event.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{event.name}</h3>
                  {event.userId !== 'family' && (
                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase rounded-md flex-shrink-0">
                      {event.userName || 'Участник'}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-tight">
                  {isToday ? 'Сегодня' : date.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })}
                </p>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                {event.type === 'shopping' ? (
                  <span className="text-xs font-bold text-zinc-400 uppercase">Ввести чек</span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className={`font-black ${event.type === 'income' ? 'text-brand-emerald' : 'text-zinc-800 dark:text-zinc-100'}`}>
                      {event.type === 'income' ? '+' : ''}{event.amount?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => handleDelete(e, event.id)}
                  className="p-1.5 text-zinc-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {events.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-4 flex items-center justify-center gap-2 text-zinc-400 font-bold text-sm bg-zinc-100 dark:bg-zinc-900 rounded-3xl mt-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Скрыть
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Показать все события {new Date().toLocaleString('ru-RU', { month: 'long' })}
            </>
          )}
        </button>
      )}
    </div>
  );
}
