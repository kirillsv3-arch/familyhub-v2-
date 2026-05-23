'use client';

import { Task } from '@/types';
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
  partnerName?: string;
  onToggle: (id: string, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, partnerName, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = () => {
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
        "group relative bg-white dark:bg-zinc-900 rounded-[2rem] p-5 border transition-all",
        task.isCompleted
          ? "border-zinc-100 dark:border-zinc-800 opacity-60"
          : "border-zinc-100 dark:border-zinc-800 shadow-sm"
      )}
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

        <div className="flex-1 min-w-0" onClick={() => setShowMenu(!showMenu)}>
          <h3 className={cn(
            "text-lg font-bold leading-tight mb-1 break-words",
            task.isCompleted && "line-through text-zinc-400"
          )}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-1">
            {task.deadline && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(task.deadline), 'HH:mm')}
              </div>
            )}

            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
              task.isGeneral
                ? "text-blue-500 bg-blue-500/10"
                : "text-zinc-500 bg-zinc-500/10"
            )}>
              {task.isGeneral ? (
                <>
                  <Users className="w-3.5 h-3.5" />
                  Общая
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  {task.assigneeId === task.createdBy ? 'Мне' : partnerName || 'Партнеру'}
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
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
                onClick={() => {
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="flex items-center justify-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
              >
                <Pencil className="w-4 h-4" />
                Изменить
              </button>
              <button
                onClick={() => {
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
