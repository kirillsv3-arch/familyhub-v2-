'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function WishlistTabs({ tabs, activeTab, onChange }: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeRef.current;

      const scrollLeft = element.offsetLeft - (container.offsetWidth / 2) + (element.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-4 px-6 no-scrollbar -mx-6"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0",
              isActive
                ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
