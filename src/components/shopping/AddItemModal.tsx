'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { StoreType, STORES } from '@/types';
import { clsx } from 'clsx';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; quantity: string | null; store: StoreType; isMarketplace: boolean; link: string | null }) => Promise<void>;
  defaultStore: StoreType;
}

export function AddItemModal({ isOpen, onClose, onAdd, defaultStore }: AddItemModalProps) {
  const [mode, setMode] = useState<'regular' | 'marketplace'>('regular');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [store, setStore] = useState<StoreType>(defaultStore === 'ПЛАН' ? 'Магнит' : defaultStore);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        name,
        quantity: mode === 'regular' ? quantity : null,
        store: mode === 'marketplace' ? 'Маркетплейсы' : store,
        isMarketplace: mode === 'marketplace',
        link: mode === 'marketplace' ? link : null,
      });
      setName('');
      setQuantity('');
      setLink('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-6 pb-10 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Добавить товар</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setMode('regular')}
                className={clsx(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  mode === 'regular' ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500"
                )}
              >
                Обычный
              </button>
              <button
                onClick={() => setMode('marketplace')}
                className={clsx(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  mode === 'marketplace' ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500"
                )}
              >
                Маркетплейс
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Название</label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Молоко"
                  className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 ring-brand-violet"
                />
              </div>

              {mode === 'regular' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Количество</label>
                      <input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1 шт, 2 кг..."
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 ring-brand-violet"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Магазин</label>
                      <select
                        value={store}
                        onChange={(e) => setStore(e.target.value as StoreType)}
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 ring-brand-violet appearance-none"
                      >
                        {STORES.filter(s => s !== 'ПЛАН' && s !== 'Маркетплейсы').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Ссылка</label>
                  <input
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Вставьте ссылку на товар"
                    className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 ring-brand-violet"
                  />
                </div>
              )}

              <button
                disabled={loading}
                className="w-full py-4 bg-brand-violet text-white font-bold rounded-2xl shadow-lg shadow-brand-violet/20 disabled:opacity-50 transition-transform active:scale-[0.98] mt-4"
              >
                {loading ? "Добавляем..." : "Добавить в список"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
