"use client";

import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";

interface ShoppingStatsProps {
  stats: {
    weeklyStats: number[];
    averageMonthly: number;
    averageWeekly: number;
  } | null;
}

export default function ShoppingStats({ stats }: ShoppingStatsProps) {
  if (!stats || stats.weeklyStats.every(v => v === 0)) return null;

  const maxAmount = Math.max(...stats.weeklyStats, 100);

  return (
    <div className="p-6 rounded-[2rem] bg-zinc-900 text-white shadow-xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Среднее в неделю</p>
          <h4 className="text-2xl font-black">{formatCurrency(stats.averageWeekly)}</h4>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Всего за 30 дней</p>
          <p className="text-xl font-bold text-brand-emerald">{formatCurrency(stats.averageMonthly)}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 h-32">
        {stats.weeklyStats.map((amount, i) => {
          const height = (amount / maxAmount) * 100;
          return (
            <div key={i} className="flex-grow flex flex-col items-center gap-2">
              <div className="w-full relative group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full bg-brand-emerald/20 rounded-t-lg relative"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-emerald rounded-full" />
                </motion.div>
                {amount > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-zinc-900 px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(amount)}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-zinc-600">Нед {i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
