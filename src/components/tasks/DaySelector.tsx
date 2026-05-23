'use client';

import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRef, useEffect } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DaySelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DaySelector({ selectedDate, onDateChange }: DaySelectorProps) {
  const today = startOfToday();
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to selected date on mount
    const selectedElement = scrollRef.current?.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-6 flex justify-between items-center">
        <h2 className="text-xl font-black capitalize">
          {format(selectedDate, 'LLLL', { locale: ru })}
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x"
      >
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              data-selected={isSelected}
              onClick={() => onDateChange(day)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all snap-center border",
                isSelected
                  ? "bg-brand-violet text-white border-brand-violet shadow-lg shadow-brand-violet/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-100 dark:border-zinc-800"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-1",
                isSelected ? "text-white/60" : "text-zinc-400"
              )}>
                {format(day, 'eee', { locale: ru })}
              </span>
              <span className="text-xl font-black">
                {format(day, 'd')}
              </span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-brand-violet mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
