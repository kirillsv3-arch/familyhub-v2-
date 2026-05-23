'use client';

import { Task, TimeOfDay } from '@/types';
import { CheckCircle2, Circle, Clock, User, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  partnerName?: string;
  onToggle: (id: string, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  'urgent-important': { label: 'Срочно / Важно', color: 'text-red-500', bg: 'bg-red-500/10' },
  'important-not-urgent': { label: 'Не срочно / Важно', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  'urgent-not-important': { label: 'Срочно / Не важно', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  'not-urgent-not-important': { label: 'Не срочно / Не важно', color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
};

const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: 'Утро',
  day: 'День',
  evening: 'Вечер',
  night: 'Ночь',
};

export function TaskCard({ task, currentUserId, partnerName, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOwnTask = !task.isGeneral && task.assigneeId === currentUserId;
  const style = CATEGORY_STYLES[task.category];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#10B981', '#F59E0B']
      });
    }
    onToggle(task.id, !task.isCompleted);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative rounded-[2rem] p-5 border transition-all",
        task.isCompleted
          ? "border-zinc-100 dark:border-zinc-800 opacity-60 bg-zinc-50 dark:bg-zinc-900/50"
          : isOwnTask
            ? "bg-brand-violet/5 border-brand-violet/10 shadow-sm"
            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm"
      )}
      onClick={() => setShowMenu(!showMenu)}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          className={cn(
            "mt-1 transition-transform active:scale-90",
            task.isCompleted ? "text-brand-emerald" : "text-zinc-300 dark:text-zinc-700"
          )}
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-7 h-7 fill-brand-emerald/10" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-lg font-bold leading-tight mb-2 break-words",
            task.isCompleted && "line-through text-zinc-400"
          )}>
            {task.title}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", style.color, style.bg)}>
              {style.label}
            </span>

            {task.deadline && (
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(task.deadline), 'HH:mm')}
              </span>
            )}

            {task.timeOfDay && !task.deadline && (
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {TIME_OF_DAY_LABELS[task.timeOfDay]}
              </span>
            )}

            {!task.deadline && !task.timeOfDay && (
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                В течение дня
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="opacity-60 text-[10px] uppercase font-bold tracking-widest">Исполнитель:</span>
            {task.isGeneral ? (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Общая</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{task.assigneeId === currentUserId ? 'Я' : partnerName || 'Партнер'}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="flex items-center justify-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
              >
                <Pencil className="w-4 h-4" />
                Изменить
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Удалить задачу?')) onDelete(task.id);
                  setShowMenu(false);
                }}
                className="flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-sm font-bold text-red-500 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
