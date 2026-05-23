'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, FamilyEvent, User, TaskCategory } from '@/types';
import { DaySelector } from '@/components/tasks/DaySelector';
import { QuadrantTabs } from '@/components/tasks/QuadrantTabs';
import { TaskCard } from '@/components/tasks/TaskCard';
import { SomedayTasks } from '@/components/tasks/SomedayTasks';
import { MonthCalendar } from '@/components/tasks/MonthCalendar';
import { TaskModal } from '@/components/tasks/TaskModal';
import { EventModal } from '@/components/tasks/EventModal';
import { Plus } from 'lucide-react';
import { isSameDay, parseISO, startOfToday } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [activeTab, setActiveTab] = useState<TaskCategory>('urgent-important');
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
    const res = await fetch('/api/user/me');
    const data = await res.json();
    setUser(data.user);
    if (data.partner) setPartner(data.partner);
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
      // If assigned to partner, send notification
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(t =>
      t.date &&
      isSameDay(parseISO(t.date), selectedDate) &&
      t.category === activeTab
    );
  }, [tasks, selectedDate, activeTab]);

  const somedayTasks = useMemo(() => {
    return tasks.filter(t => !t.date);
  }, [tasks]);

  const dayEvents = useMemo(() => {
    return events.filter(e => isSameDay(parseISO(e.date), selectedDate));
  }, [events, selectedDate]);

  return (
    <main className="min-h-screen pb-20 bg-zinc-50 dark:bg-black">
      <div className="pt-8 pb-4">
        <DaySelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <QuadrantTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="px-6 py-6 space-y-4">
        {dayEvents.length > 0 && (
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

        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              partnerName={partner?.name}
              onToggle={handleToggleTask}
              onEdit={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
            />
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-10 text-zinc-400">
            <p className="text-sm font-medium">Нет задач в этой категории</p>
          </div>
        )}
      </div>

      <SomedayTasks
        tasks={somedayTasks}
        partnerName={partner?.name}
        onToggle={handleToggleTask}
        onEdit={(t) => {
          setEditingTask(t);
          setIsTaskModalOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

      <MonthCalendar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        tasks={tasks}
        events={events}
        onAddEvent={() => setIsEventModalOpen(true)}
      />

      <div className="fixed bottom-24 right-6 pointer-events-none">
        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="w-16 h-16 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/30 pointer-events-auto active:scale-95 transition-transform"
        >
          <Plus className="w-10 h-10" />
        </button>
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
