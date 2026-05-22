'use client';

import { useState, useMemo } from 'react';
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
      // Basic expansion logic
      if (event.dateType === 'dayOfMonth') {
        // Find days in current and next month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        [0, 1, 2].forEach(monthOffset => {
          const d = new Date(currentYear, currentMonth + monthOffset, 1);
          event.dateValue.forEach(day => {
            const date = new Date(d.getFullYear(), d.getMonth(), day);
            if (date >= today && date <= horizon) {
              occurrences.push({ ...event, date: date.toISOString(), isTemplate: true });
            }
          });
        });
      } else if (event.dateType === 'dayOfWeek') {
         const d = new Date(today);
         while (d <= horizon) {
           if (event.dateValue.includes(d.getDay())) {
             occurrences.push({ ...event, date: new Date(d).toISOString(), isTemplate: true });
           }
           d.setDate(d.getDate() + 1);
         }
      }
      // Add other dateTypes...
    });

    return occurrences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const refreshData = async () => {
    // Re-fetch logic or just optimistic updates
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
