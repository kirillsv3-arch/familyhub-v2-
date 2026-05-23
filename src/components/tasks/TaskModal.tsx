'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory } from '@/types';
import { X, Calendar as CalendarIcon, Clock, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  selectedDate: Date;
  partnerName?: string;
  partnerId?: string;
}

const CATEGORIES: { id: TaskCategory; label: string; color: string }[] = [
  { id: 'urgent-important', label: 'Срочно-Важно', color: 'bg-red-500' },
  { id: 'important-not-urgent', label: 'Важно-Не срочно', color: 'bg-orange-500' },
  { id: 'urgent-not-important', label: 'Срочно-Не важно', color: 'bg-blue-500' },
  { id: 'not-urgent-not-important', label: 'Не срочно-Не важно', color: 'bg-zinc-500' },
];

export function TaskModal({ isOpen, onClose, onSave, initialTask, selectedDate, partnerName, partnerId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('urgent-important');
  const [isSomeday, setIsSomeday] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [isGeneral, setIsGeneral] = useState(true);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setIsSomeday(!initialTask.date);
      setDeadline(initialTask.deadline ? format(new Date(initialTask.deadline), 'HH:mm') : '');
      setIsGeneral(initialTask.isGeneral);
      setAssigneeId(initialTask.assigneeId);
    } else {
      setTitle('');
      setDescription('');
      setCategory('urgent-important');
      setIsSomeday(false);
      setDeadline('');
      setIsGeneral(true);
      setAssigneeId(null);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return;

    let finalDeadline = null;
    if (deadline && !isSomeday) {
      const [hours, minutes] = deadline.split(':');
      const d = new Date(selectedDate);
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      finalDeadline = d.toISOString();
    }

    onSave({
      title,
      description,
      category,
      date: isSomeday ? null : selectedDate.toISOString(),
      deadline: finalDeadline,
      isGeneral,
      assigneeId: isGeneral ? null : assigneeId,
    });
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
            <h2 className="text-2xl font-black">
              {initialTask ? 'Изменить задачу' : 'Новая задача'}
            </h2>
            <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Название</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать?"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-violet outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Добавьте детали..."
                rows={2}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-5 py-4 font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-violet outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Категория</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                      category === cat.id
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg"
                        : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-100 dark:border-zinc-700"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0", cat.color)} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Когда</label>
                <button
                  onClick={() => setIsSomeday(!isSomeday)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border font-bold text-sm",
                    !isSomeday ? "bg-brand-violet/10 border-brand-violet/20 text-brand-violet" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {isSomeday ? 'Когда-нибудь' : format(selectedDate, 'd MMMM', { locale: ru })}
                  </div>
                </button>
              </div>

              {!isSomeday && (
                <div className="w-32">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Время</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="time"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl pl-10 pr-4 py-4 font-bold focus:ring-2 focus:ring-brand-violet outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Исполнитель</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsGeneral(true);
                    setAssigneeId(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all",
                    isGeneral ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                  )}
                >
                  <Users className="w-4 h-4" />
                  Общая
                </button>
                <button
                  onClick={() => {
                    setIsGeneral(false);
                    setAssigneeId(initialTask?.assigneeId || 'me');
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all",
                    !isGeneral ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                  )}
                >
                  <User className="w-4 h-4" />
                  Личная
                </button>
              </div>

              {!isGeneral && partnerName && (
                <div className="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center gap-4">
                  <span className="text-xs font-bold text-zinc-400 ml-2">Назначить:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assigneeId === partnerId}
                      onChange={(e) => setAssigneeId(e.target.checked ? (partnerId || null) : 'me')}
                      className="w-5 h-5 rounded-lg border-zinc-300 text-brand-violet focus:ring-brand-violet"
                    />
                    <span className="text-sm font-bold">{partnerName}</span>
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full py-5 bg-brand-violet text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-violet/20 active:scale-[0.98] transition-all"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
