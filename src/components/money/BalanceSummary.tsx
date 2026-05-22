"use client";

import { useMemo } from "react";
import { FinanceEvent } from "@/types";
import { formatCurrency } from "@/lib/formatters";

interface BalanceSummaryProps {
  events: FinanceEvent[];
}

export default function BalanceSummary({ events }: BalanceSummaryProps) {
  const freeBalance = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let expectedIncome = 0;
    let expectedExpenses = 0;

    events.forEach(event => {
      // One-time events that are completed don't count towards "expected"
      if (event.isCompleted) return;
      if (!event.active) return;

      // Purchases and events without exact amounts are excluded as per requirements
      if (event.type === 'purchase') return;
      if (event.amount <= 0) return;

      const eventOccurrences = [];

      if (event.repeatMonthly) {
        // If it's a monthly event, it occurs at most once more this month if its date hasn't passed
        if (event.dateType === 'dayOfMonth') {
          if (event.dateValue > today.getDate()) {
            eventOccurrences.push(event.amount);
          }
        } else if (event.dateType === 'dayOfWeek') {
          // Check if this day of week occurs again this month
          for (let d = today.getDate() + 1; d <= lastDayOfMonth; d++) {
            const date = new Date(currentYear, currentMonth, d);
            if (date.getDay() === event.dateValue) {
              eventOccurrences.push(event.amount);
            }
          }
        }
      } else {
        // One-time event
        if (event.dateType === 'dayOfMonth') {
           if (event.dateValue > today.getDate()) {
             eventOccurrences.push(event.amount);
           }
        }
        // Simplified: one-time events are usually dayOfMonth for specific date
      }

      eventOccurrences.forEach(amt => {
        if (event.type === 'income') {
          expectedIncome += amt;
        } else {
          expectedExpenses += amt;
        }
      });
    });

    return expectedIncome - expectedExpenses;
  }, [events]);

  const isNegative = freeBalance < 0;

  return (
    <div className="mb-8 text-center">
      <p className="text-zinc-500 font-medium mb-1">Свободно до конца месяца</p>
      <h2 className={`text-4xl font-black transition-colors ${isNegative ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {formatCurrency(freeBalance)}
      </h2>
    </div>
  );
}
