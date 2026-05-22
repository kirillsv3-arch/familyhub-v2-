"use client";

import { useMemo } from "react";
import { PiggyBank, WishlistItem } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Plus, Gift } from "lucide-react";
import { motion } from "framer-motion";

interface PiggyBanksProps {
  savings: PiggyBank[];
  wishlist: WishlistItem[];
  onAddFromWishlist: (item: WishlistItem) => void;
  onContribute: (id: string) => void;
}

export default function PiggyBanks({ savings, wishlist, onAddFromWishlist, onContribute }: PiggyBanksProps) {
  const isCarousel = savings.length > 2;

  const wishlistItemsToPull = useMemo(() => {
    const existingWishlistIds = new Set(savings.map(s => s.wishlistItemId));
    return wishlist.filter(item => !existingWishlistIds.has(item.id));
  }, [savings, wishlist]);

  const renderPiggyBank = (bank: PiggyBank) => {
    const progress = Math.min((bank.currentAmount / bank.targetAmount) * 100, 100);

    return (
      <div
        key={bank.id}
        className={`p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex-shrink-0 ${isCarousel ? 'w-64' : 'w-full'}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-bold mb-1">{bank.title}</h4>
            <p className="text-xs text-zinc-500 font-medium">
              Цель: {formatCurrency(bank.targetAmount)}
            </p>
          </div>
          <button
            onClick={() => onContribute(bank.id)}
            className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>{formatCurrency(bank.currentAmount)}</span>
            <span className="text-brand-emerald">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-brand-emerald rounded-full"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Копилки</h3>
      </div>

      <div className={`${isCarousel ? 'flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-6 px-6' : 'space-y-3'}`}>
        {savings.map(renderPiggyBank)}

        {wishlistItemsToPull.length > 0 && (
          <div
            className={`p-5 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center flex-shrink-0 ${isCarousel ? 'w-64' : 'w-full'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
              <Gift className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-bold mb-3">Есть цели из Вишлиста</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {wishlistItemsToPull.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => onAddFromWishlist(item)}
                  className="px-3 py-2 bg-brand-violet/10 text-brand-violet text-xs font-bold rounded-xl"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
