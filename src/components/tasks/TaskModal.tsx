'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory, TimeOfDay } from '@/types';
import { X, Clock, User, Users, Sun, Sunrise, Sunset, Moon, Check, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MonthCalendar.css';
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
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeType, setTimeType] = useState<'none' | 'timeOfDay' | 'exact'>('none');
  const [deadline, setDeadline] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [isGeneral, setIsGeneral] = useState(true);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setIsSomeday(!initialTask.date);
      if (initialTask.date) setCurrentDate(new Date(initialTask.date));

      if (initialTask.deadline) {
        setTimeType('exact');
        setDeadline(format(new Date(initialTask.deadline), 'HH:mm'));
      } else if (initialTask.timeOfDay) {
        setTimeType('timeOfDay');
        setTimeOfDay(initialTask.timeOfDay);
      } else {
        setTimeType('none');
      }

      setIsGeneral(initialTask.isGeneral);
      setAssigneeId(initialTask.assigneeId || 'me');
    } else {
      setTitle('');
      setDescription('');
      setCategory('urgent-important');
      setIsSomeday(false);
      setCurrentDate(selectedDate);
      setTimeType('none');
      setDeadline('');
      setTimeOfDay('morning');
      setIsGeneral(true);
      setAssigneeId('me');
    }
    setShowDatePicker(false);
  }, [initialTask, isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return;

    let finalDeadline = null;
    let finalTimeOfDay = null;

    if (!isSomeday) {
        if (timeType === 'exact' && deadline) {
            const [hours, minutes] = deadline.split(':');
            const d = new Date(currentDate);
            d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            finalDeadline = d.toISOString();
        } else if (timeType === 'timeOfDay') {
            finalTimeOfDay = timeOfDay;
        }
    }

    onSave({
      title,
      description,
      category,
      date: isSomeday ? null : currentDate.toISOString(),
      deadline: finalDeadline,
      timeOfDay: finalTimeOfDay,
      isGeneral: isSomeday ? true : isGeneral,
      assigneeId: (isSomeday || isGeneral) ? null : (assigneeId === 'me' ? null : assigneeId),
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
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {showDatePicker ? (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowDatePicker(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-black">Выберите дату</h2>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-4">
                    <Calendar
                        onChange={(val) => {
                            setCurrentDate(val as Date);
                            setShowDatePicker(false);
                        }}
                        value={currentDate}
                        locale="ru-RU"
                        className="w-full border-none font-sans bg-transparent"
                    />
                </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide pb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black">
                  {initialTask ? 'Изменить задачу' : 'Новая задача'}
                </h2>
                <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

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

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Дата и Время</label>
                <div className="flex gap-2 mb-3">
                  <button
                      onClick={() => setIsSomeday(false)}
                      className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2",
                          !isSomeday ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-100"
                      )}
                  >
                      <span onClick={(e) => { e.stopPropagation(); setShowDatePicker(true); }} className="hover:underline">
                        {format(currentDate, 'd MMMM', { locale: ru })}
                      </span>
                  </button>
                  <button
                      onClick={() => setIsSomeday(true)}
                      className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold border transition-all",
                          isSomeday ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-100"
                      )}
                  >
                      Когда-нибудь
                  </button>
                </div>

                {!isSomeday && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {(['none', 'timeOfDay', 'exact'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeType(t)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                        timeType === t ? "bg-brand-violet text-white border-brand-violet" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-transparent"
                                    )}
                                >
                                    {t === 'none' ? 'Весь день' : t === 'timeOfDay' ? 'Время суток' : 'Точное'}
                                </button>
                            ))}
                        </div>

                        {timeType === 'timeOfDay' && (
                            <div className="grid grid-cols-4 gap-2">
                                {(['morning', 'day', 'evening', 'night'] as const).map((tod) => {
                                    const icons = { morning: Sunrise, day: Sun, evening: Sunset, night: Moon };
                                    const labels = { morning: 'Утро', day: 'День', evening: 'Вечер', night: 'Ночь' };
                                    const Icon = icons[tod];
                                    return (
                                        <button
                                            key={tod}
                                            onClick={() => setTimeOfDay(tod)}
                                            className={cn(
                                                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                                                timeOfDay === tod ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-400"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[10px] font-bold">{labels[tod]}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {timeType === 'exact' && (
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="time"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-brand-violet outline-none"
                                />
                            </div>
                        )}
                    </div>
                )}
              </div>

              {!isSomeday && (
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Исполнитель</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsGeneral(true)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all",
                        isGeneral ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                      )}
                    >
                      <Users className="w-4 h-4" />
                      Общая
                    </button>
                    <button
                      onClick={() => setIsGeneral(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all",
                        !isGeneral ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                      )}
                    >
                      <User className="w-4 h-4" />
                      Личная
                    </button>
                  </div>

                  {!isGeneral && (
                    <div className="mt-3 p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex flex-col gap-1">
                      <button
                        onClick={() => setAssigneeId('me')}
                        className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                            assigneeId === 'me' ? "bg-white dark:bg-zinc-700 shadow-sm" : "opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">Я</span>
                        </div>
                        {assigneeId === 'me' && <Check className="w-4 h-4 text-brand-violet" />}
                      </button>

                      {partnerName && (
                        <button
                            onClick={() => setAssigneeId(partnerId || null)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                                assigneeId === partnerId ? "bg-white dark:bg-zinc-700 shadow-sm" : "opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">{partnerName}</span>
                            </div>
                            {assigneeId === partnerId && <Check className="w-4 h-4 text-blue-500" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full py-5 bg-brand-violet text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-violet/20 active:scale-[0.98] transition-all"
              >
                Сохранить
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
