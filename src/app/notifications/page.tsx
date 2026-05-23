'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@/types';
import { ShoppingBag, TrendingUp, CheckSquare, Info, ChevronLeft, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP = {
  task: { icon: CheckSquare, color: 'bg-brand-violet' },
  shopping: { icon: ShoppingBag, color: 'bg-brand-emerald' },
  finance: { icon: TrendingUp, color: 'bg-blue-500' },
  system: { icon: Info, color: 'bg-zinc-500' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pb-24">
      <header className="p-6 flex items-center gap-4">
        <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-black">Уведомления</h1>
      </header>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Bell className="w-12 h-12 animate-bounce" />
            <p className="font-bold">Загрузка истории...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
            <p className="font-bold">История пуста</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif, idx) => {
              const { icon: Icon, color } = ICON_MAP[notif.type] || ICON_MAP.system;
              const date = notif.createdAt
                ? (typeof notif.createdAt === 'string' ? new Date(notif.createdAt) : (notif.createdAt as unknown as { toDate?: () => Date }).toDate?.() || new Date())
                : new Date();

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex gap-4"
                >
                  <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-${color.replace('bg-', '')}/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm leading-tight">{notif.title}</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter shrink-0 ml-2">
                        {format(date, 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-widest">
                      {format(date, 'd MMMM', { locale: ru })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
