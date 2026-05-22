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
    return 'bg-zinc-400';
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {days.map((day, i) => {
          const dots = getDotsForDay(day);
          const isToday = i === 0;

          return (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[3rem]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {day.toLocaleString('ru-RU', { weekday: 'short' })}
                </span>
                <span className={`text-sm font-black ${isToday ? 'text-brand-violet' : 'text-zinc-600'}`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="h-12 w-1 flex flex-col-reverse gap-1 items-center">
                {dots.map((dot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-2.5 h-2.5 rounded-full ${getDotColor(dot.type, dot.category)} shadow-sm`}
                  />
                ))}
                <div className="flex-1 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
              </div>

              {isToday && (
                <div className="text-[10px] font-black text-brand-violet uppercase">Сегодня</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
