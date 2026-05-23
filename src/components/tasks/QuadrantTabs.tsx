'use client';

import { TaskCategory } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuadrantTabsProps {
  activeTab: TaskCategory;
  onTabChange: (tab: TaskCategory) => void;
}

const CATEGORIES: { id: TaskCategory; label: string; color: string }[] = [
  { id: 'urgent-important', label: 'Срочно', color: 'bg-red-500' },
  { id: 'important-not-urgent', label: 'Важно', color: 'bg-orange-500' },
  { id: 'urgent-not-important', label: 'Не важно', color: 'bg-blue-500' },
  { id: 'not-urgent-not-important', label: 'Потом', color: 'bg-zinc-500' },
];

export function QuadrantTabs({ activeTab, onTabChange }: QuadrantTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-6 py-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = activeTab === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onTabChange(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border shrink-0",
              isActive
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-100 dark:border-zinc-800"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", cat.color)} />
              {cat.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
