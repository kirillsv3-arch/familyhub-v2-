'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StoreType, STORES } from '@/types';
import { clsx } from 'clsx';

interface StoreTabsProps {
  activeTab: StoreType;
  onTabChange: (tab: StoreType) => void;
}

export function StoreTabs({ activeTab, onTabChange }: StoreTabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIndex = STORES.indexOf(activeTab);
    const activeTabElement = tabsRef.current[activeIndex];
    const container = containerRef.current;

    if (activeTabElement && container) {
      const containerWidth = container.offsetWidth;
      const tabOffsetLeft = activeTabElement.offsetLeft;
      const tabWidth = activeTabElement.offsetWidth;

      const scrollTo = tabOffsetLeft - containerWidth / 2 + tabWidth / 2;
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto scrollbar-hide py-4 px-4 gap-2 sticky top-0 bg-white dark:bg-zinc-950 z-10"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {STORES.map((store, index) => (
        <button
          key={store}
          ref={(el) => {
            tabsRef.current[index] = el;
          }}
          onClick={() => onTabChange(store)}
          className={clsx(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === store ? "text-white" : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          {activeTab === store && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-brand-violet rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {store}
        </button>
      ))}
    </div>
  );
}
