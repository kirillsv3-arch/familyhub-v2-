'use client';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, FamilyEvent } from '@/types';
import { isSameDay, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import './MonthCalendar.css';

interface MonthCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  events: FamilyEvent[];
  onAddEvent: () => void;
}

export function MonthCalendar({ selectedDate, onDateChange, tasks, events, onAddEvent }: MonthCalendarProps) {
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const hasTasks = tasks.some(t => t.date && isSameDay(parseISO(t.date), date));
    const dayEvents = events.filter(e => isSameDay(parseISO(e.date), date));

    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-brand-violet" />}
        {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      </div>
    );
  };

  return (
    <div className="px-6 pb-24">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Календарь</h3>
          <button
            onClick={onAddEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Событие
          </button>
        </div>

        <Calendar
          onChange={(val) => onDateChange(val as Date)}
          value={selectedDate}
          locale="ru-RU"
          tileContent={tileContent}
          className="w-full border-none font-sans"
        />
      </div>
    </div>
  );
}
