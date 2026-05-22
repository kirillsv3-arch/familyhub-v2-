'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, FinanceEvent, FinanceHistory, SavingGoal } from '@/types';
import { Plus, Calendar, PieChart, Target } from 'lucide-react';
import { HorizonRibbon } from '@/components/finance/HorizonRibbon';
import { FreeMoneyCounter } from '@/components/finance/FreeMoneyCounter';
import { EventList } from '@/components/finance/EventList';
import { SavingsGallery } from '@/components/finance/SavingsGallery';
import { ShoppingStats } from '@/components/finance/ShoppingStats';
import { AddEventModal } from '@/components/finance/AddEventModal';
import { ShoppingCheckModal } from '@/components/finance/ShoppingCheckModal';

interface FinanceClientProps {
  initialEvents: FinanceEvent[];
  initialHistory: FinanceHistory[];
  initialSavings: SavingGoal[];
  currentUser: User;
  members: { uid: string; name: string }[];
}

export default function FinanceClient({
  initialEvents,
  initialHistory,
  initialSavings,
  currentUser,
  members
}: FinanceClientProps) {
  const [events, setEvents] = useState<FinanceEvent[]>(initialEvents);
  const [history, setHistory] = useState<FinanceHistory[]>(initialHistory);
  const [savings, setSavings] = useState<SavingGoal[]>(initialSavings);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [selectedShoppingEvent, setSelectedShoppingEvent] = useState<FinanceEvent & { date: string } | null>(null);

  // Logic to calculate virtual occurrences for the next 45 days
  const virtualEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date();
    horizon.setDate(today.getDate() + 45);

    const occurrences: (FinanceEvent & { date: string; isTemplate: boolean })[] = [];

    events.forEach(event => {
      const dValue = Array.isArray(event.dateValue) ? event.dateValue : [event.dateValue];

      // Basic expansion logic
      if (event.dateType === 'dayOfMonth') {
        // Find days in current and next month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        [0, 1, 2].forEach(monthOffset => {
          const d = new Date(currentYear, currentMonth + monthOffset, 1);
          const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          dValue.forEach(day => {
            if (day <= daysInMonth) {
              const date = new Date(d.getFullYear(), d.getMonth(), day);
              if (date >= today && date <= horizon) {
                occurrences.push({ ...event, date: date.toISOString(), isTemplate: true });
              }
            }
          });
        });
      } else if (event.dateType === 'dayOfWeek') {
         const d = new Date(today);
         while (d <= horizon) {
           if (dValue.includes(d.getDay())) {
             occurrences.push({ ...event, date: new Date(d).toISOString(), isTemplate: true });
           }
           d.setDate(d.getDate() + 1);
         }
      } else if (event.dateType === 'nthDayOfWeek') {
         const [nth, dayOfWeek] = dValue;
         const currentYear = today.getFullYear();
         const currentMonth = today.getMonth();

         [0, 1, 2].forEach(monthOffset => {
            const firstOfMonth = new Date(currentYear, currentMonth + monthOffset, 1);
            let count = 0;
            const d = new Date(firstOfMonth);
            while (d.getMonth() === firstOfMonth.getMonth()) {
               if (d.getDay() === dayOfWeek) {
                  count++;
                  if (count === nth) {
                     if (d >= today && d <= horizon) {
                        occurrences.push({ ...event, date: d.toISOString(), isTemplate: true });
                     }
                     break;
                  }
               }
               d.setDate(d.getDate() + 1);
            }
         });
      }
    });

    return occurrences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // Fallback notification trigger (client-side)
  useEffect(() => {
    const checkReminders = async () => {
      const today = new Date();
      today.setHours(0,0,0,0);

      const upcoming = virtualEvents.filter(e => {
        const eventDate = new Date(e.date);
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= (e.reminderDaysBefore || 2) && e.reminderEnabled;
      });

      if (upcoming.length > 0) {
        const lastNotified = localStorage.getItem('finance_last_notified');
        const todayStr = today.toISOString().split('T')[0];

        if (lastNotified !== todayStr) {
          try {
            await fetch('/api/finance/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Бюджет: Предстоящие траты',
                body: `Напоминаем о ${upcoming.length} событиях в ближайшие дни.`
              })
            });
            localStorage.setItem('finance_last_notified', todayStr);
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    if (virtualEvents.length > 0) {
      checkReminders();
    }
  }, [virtualEvents]);

  const refreshData = async () => {
    const res = await fetch('/api/finance/events');
    if (res.ok) setEvents(await res.json());

    const resH = await fetch('/api/finance/history');
    if (resH.ok) setHistory(await resH.json());

    const resS = await fetch('/api/finance/savings');
    if (resS.ok) setSavings(await resS.json());
  };

  return (
    <main className="p-6 pb-32 bg-zinc-50 dark:bg-black min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Бюджет</h1>
          <p className="text-zinc-500 font-medium">Ваш горизонт на 45 дней</p>
        </div>
      </header>

      <div className="space-y-8">
        <FreeMoneyCounter
          events={events}
          history={history}
          currentUser={currentUser}
        />

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-brand-violet" />
            <h2 className="text-xl font-bold">Горизонт</h2>
          </div>
          <HorizonRibbon events={virtualEvents} />
          <div className="mt-6">
            <EventList
              events={virtualEvents}
              onShoppingClick={(event: FinanceEvent & { date: string }) => {
                setSelectedShoppingEvent(event);
                setIsShoppingModalOpen(true);
              }}
              onRefresh={refreshData}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-violet" />
            <h2 className="text-xl font-bold">Копилки</h2>
          </div>
          <SavingsGallery goals={savings} onRefresh={refreshData} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-brand-violet" />
            <h2 className="text-xl font-bold">Закупки</h2>
          </div>
          <ShoppingStats history={history} />
        </section>
      </div>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/30 active:scale-95 transition-transform z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      {isAddModalOpen && (
        <AddEventModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={refreshData}
          members={members}
        />
      )}

      {isShoppingModalOpen && selectedShoppingEvent && (
        <ShoppingCheckModal
          event={selectedShoppingEvent}
          onClose={() => setIsShoppingModalOpen(false)}
          onSuccess={refreshData}
        />
      )}
    </main>
  );
}
