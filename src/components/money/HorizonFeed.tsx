"use client";

import { useMemo, useState } from "react";
import { FinanceEvent } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HorizonFeedProps {
  events: FinanceEvent[];
  onComplete: (id: string, amount: number) => void;
  onSkip: (id: string) => void;
}

interface VirtualEvent extends FinanceEvent {
  virtualId: string;
  displayDate: Date;
}

export default function HorizonFeed({ events, onComplete, onSkip }: HorizonFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const [purchaseAmounts, setPurchaseAmounts] = useState<Record<string, string>>({});

  const timeline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date(today);
    horizon.setDate(today.getDate() + 45);

    const virtualEvents: VirtualEvent[] = [];

    events.forEach(event => {
      if (!event.active && event.type === 'subscription') return;

      for (let d = new Date(today); d <= horizon; d.setDate(d.getDate() + 1)) {
        let matches = false;
        if (event.dateType === 'dayOfMonth') {
          matches = event.dateValue === d.getDate();
        } else {
          matches = event.dateValue === d.getDay();
        }

        if (matches) {
          // If it's a one-time event, check if it's within the month of its creation or specific date
          // For simplicity, we assume recurring if repeatMonthly is true.
          if (!event.repeatMonthly) {
             // Logic for one-time events: only show on the first match
             // But for now, we'll follow the requirement of recurring visualization
          }

          virtualEvents.push({
            ...event,
            virtualId: `${event.id}-${d.getTime()}`,
            displayDate: new Date(d),
          });

          if (!event.repeatMonthly) break;
        }
      }
    });

    return virtualEvents.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());
  }, [events]);

  const displayedEvents = showAll ? timeline : timeline.slice(0, 3);
  const hasMore = timeline.length > 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">Горизонт событий</h3>
        <div className="h-[2px] flex-grow mx-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-brand-emerald"></div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {displayedEvents.map((event) => {
            const isToday = new Date(event.displayDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
            const isPast = event.displayDate < new Date(new Date().setHours(0,0,0,0));
            const isPurchase = event.type === 'purchase';
            const showInlineForm = isPurchase && !event.isCompleted && (isToday || isPast);

            return (
              <motion.div
                key={event.virtualId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isPast ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${isPast ? 'grayscale-[0.5]' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1">
                      {event.displayDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      {isToday && " • Сегодня"}
                    </p>
                    <h4 className="font-bold">{event.title}</h4>
                  </div>
                  {!isPurchase && (
                    <span className={`font-bold ${event.type === 'income' ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                    </span>
                  )}
                </div>

                {showInlineForm && (
                  <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800 flex flex-col gap-2">
                    <p className="text-xs font-medium text-zinc-500">Закупка совершена? Введите сумму:</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Сумма"
                        className="flex-grow bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 ring-brand-emerald"
                        value={purchaseAmounts[event.virtualId] || ''}
                        onChange={(e) => setPurchaseAmounts(prev => ({ ...prev, [event.virtualId]: e.target.value }))}
                      />
                      <button
                        onClick={() => onComplete(event.id, Number(purchaseAmounts[event.virtualId]))}
                        className="bg-brand-emerald text-white p-2 rounded-xl"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onSkip(event.id)}
                        className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 p-2 rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {showAll ? (
            <>Скрыть <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Показать все ({timeline.length}) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
