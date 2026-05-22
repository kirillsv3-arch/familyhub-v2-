'use client';

import { ShoppingItem } from '@/types';
import { Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onToggle: (id: string, isBought: boolean) => void;
  onOpenLink?: (link: string) => void;
}

export function ShoppingItemCard({ item, onToggle, onOpenLink }: ShoppingItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={clsx(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
        item.isBought
          ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/50 opacity-60"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
      )}
    >
      <button
        onClick={() => onToggle(item.id, !item.isBought)}
        className={clsx(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          item.isBought
            ? "bg-brand-emerald border-brand-emerald text-white"
            : "border-zinc-300 dark:border-zinc-700 hover:border-brand-emerald"
        )}
      >
        {item.isBought && <Check className="w-5 h-5 stroke-[3]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={clsx(
            "font-semibold transition-all duration-300 truncate",
            item.isBought && "line-through text-zinc-500"
          )}>
            {item.name}
          </p>
          {item.isMarketplace && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">
              MP
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {item.quantity && <span>{item.quantity} {item.unit}</span>}
          {item.quantity && <span>•</span>}
          <span>{item.store}</span>
          {item.price && (
            <>
              <span>•</span>
              <span className="font-bold text-brand-emerald">{item.price} ₽</span>
            </>
          )}
        </div>
      </div>

      {item.isMarketplace && item.link && (
        <button
          onClick={() => onOpenLink?.(item.link!)}
          className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ExternalLink className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      )}
    </motion.div>
  );
}
