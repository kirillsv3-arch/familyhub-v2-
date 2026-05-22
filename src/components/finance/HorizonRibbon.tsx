'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { FinanceEvent } from '@/types';

interface HorizonRibbonProps {
  events: (FinanceEvent & { date: string })[];
}

export function HorizonRibbon({ events }: HorizonRibbonProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 45 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const getDotsForDay = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getDotColor = (type: string, category?: string) => {
    if (type === 'income') return 'bg-brand-emerald';
    if (type === 'subscription') return 'bg-brand-violet';
    if (type === 'shopping') return 'bg-zinc-400';
    if (category === 'loan') return 'bg-amber-400';
    return 'bg-zinc-300 dark:bg-zinc-700';
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {days.map((day, i) => {
          const dots = getDotsForDay(day);
          const isToday = i === 0;

          return (
            <div
              key={i}
              className={`flex-shrink-0 flex flex-col items-center gap-3 min-w-[4.5rem] py-4 rounded-3xl transition-all ${
                isToday ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/25' : 'bg-white dark:bg-zinc-900'
              }`}
              style={{ scrollSnapAlign: 'center' }}
            >
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-white/60' : 'text-zinc-400'}`}>
                  {day.toLocaleString('ru-RU', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-black ${isToday ? 'text-white' : 'text-zinc-800 dark:text-zinc-100'}`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="flex gap-1 min-h-[6px]">
                {dots.slice(0, 3).map((dot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : getDotColor(dot.type, dot.category)}`}
                  />
                ))}
                {dots.length === 0 && <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
