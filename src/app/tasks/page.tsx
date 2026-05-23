'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, FamilyEvent, User } from '@/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { MonthCalendar } from '@/components/tasks/MonthCalendar';
import { TaskModal } from '@/components/tasks/TaskModal';
import { EventModal } from '@/components/tasks/EventModal';
import { Plus, Info, ChevronRight } from 'lucide-react';
import { isSameDay, parseISO, startOfToday, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';

const TIME_ORDER = { morning: 1, day: 2, evening: 3, night: 4 };
const CATEGORY_ORDER = { 'urgent-important': 1, 'important-not-urgent': 2, 'urgent-not-important': 3, 'not-urgent-not-important': 4 };

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [showSomeday, setShowSomeday] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, eventsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/events')
      ]);
      const tasksData = await tasksRes.json();
      const eventsData = await eventsRes.json();
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (data.user) setUser(data.user);
        if (data.partner) setPartner(data.partner);
    } catch (err) {
        console.error("Failed to fetch user/partner:", err);
    }
  };

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const method = editingTask ? 'PATCH' : 'POST';
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';

    const res = await fetch(url, {
      method,
      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      if (partner && taskData.assigneeId === partner.uid && !editingTask) {
        await fetch('/api/tasks/notify', {
          method: 'POST',
          body: JSON.stringify({
            assigneeId: partner.uid,
            title: 'Новая задача для тебя!',
            body: `${user?.name} назначил(а) тебе задачу: ${taskData.title}`,
          }),
        });
      }
      fetchData();
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleSaveEvent = async (eventData: Partial<FamilyEvent>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    if (res.ok) fetchData();
  };

  const sortedDayTasks = useMemo(() => {
    const filtered = showSomeday
        ? tasks.filter(t => !t.date)
        : tasks.filter(t => t.date && isSameDay(parseISO(t.date), selectedDate));

    return filtered.sort((a, b) => {
        // 1. Priority (Eisenhower Category)
        if (a.category !== b.category) {
            return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
        }

        // 2. Exact time
        if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
        if (a.deadline) return -1;
        if (b.deadline) return 1;

        // 3. Time of day
        if (a.timeOfDay && b.timeOfDay) return TIME_ORDER[a.timeOfDay] - TIME_ORDER[b.timeOfDay];
        if (a.timeOfDay) return -1;
        if (b.timeOfDay) return 1;

        return 0;
    });
  }, [tasks, selectedDate, showSomeday]);

  const somedayTasksCount = tasks.filter(t => !t.date).length;

  const dayEvents = useMemo(() => {
    return events.filter(e => {
        const eventDate = parseISO(e.date);
        if (e.isRecurring) {
            return eventDate.getDate() === selectedDate.getDate() && eventDate.getMonth() === selectedDate.getMonth();
        }
        return isSameDay(eventDate, selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <main className="flex flex-col h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      {/* Upper Zone: Scrollable Task List */}
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6 space-y-6 scrollbar-hide">
        <header className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black">
                    {showSomeday ? '💡 Идеи' : format(selectedDate, 'd MMMM', { locale: ru })}
                </h1>
                {showSomeday && (
                    <button
                        onClick={() => setShowSomeday(false)}
                        className="text-xs font-bold text-brand-violet mt-1 flex items-center gap-1"
                    >
                        Вернуться к календарю
                    </button>
                )}
            </div>
            <button
                onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                }}
                className="w-10 h-10 bg-brand-violet text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-violet/20"
            >
                <Plus className="w-6 h-6" />
            </button>
        </header>

        {dayEvents.length > 0 && !showSomeday && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dayEvents.map(event => (
                    <div
                        key={event.id}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-800 shrink-0"
                    >
                        <span>✨ {event.title}</span>
                    </div>
                ))}
            </div>
        )}

        {sortedDayTasks.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedDayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={user?.uid}
                  partnerName={partner?.name}
                  onToggle={handleToggleTask}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  isIdeaView={showSomeday}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <Info className="w-8 h-8 text-zinc-300" />
            </div>
            {somedayTasksCount > 0 && !showSomeday ? (
                <div className="space-y-3 px-4">
                    <p className="font-bold text-zinc-500 text-balance leading-relaxed">На сегодня задач нет, но у вас есть неразбранные задачи в разделе &quot;Идеи&quot;</p>
                    <button
                        onClick={() => setShowSomeday(true)}
                        className="text-brand-violet font-bold flex items-center gap-1 mx-auto px-6 py-3 bg-brand-violet/10 rounded-2xl active:scale-95 transition-all"
                    >
                        Посмотреть идеи <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <p className="font-bold text-zinc-400">{showSomeday ? 'В разделе "Идеи" пока пусто' : 'Задач нет. Добавьте новую задачу'}</p>
            )}
          </div>
        )}
      </div>

      {/* Lower Zone: Fixed Calendar */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 rounded-t-[3rem] shadow-2xl shrink-0">
        <div className="px-2 pt-2">
            <MonthCalendar
                selectedDate={selectedDate}
                onDateChange={(date) => {
                    setSelectedDate(date);
                    setShowSomeday(false);
                }}
                tasks={tasks}
                events={events}
                onAddEvent={() => setIsEventModalOpen(true)}
            />
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        selectedDate={selectedDate}
        partnerName={partner?.name}
        partnerId={partner?.uid}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />
    </main>
  );
}
