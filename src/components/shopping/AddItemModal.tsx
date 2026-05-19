'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ChevronDown } from 'lucide-react';
import { StoreType, STORES } from '@/types';
import { clsx } from 'clsx';

const UNITS = ['шт', 'кг', 'л', 'упак', 'гр', 'мл'];

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    quantity: number | null;
    unit: string | null;
    store: StoreType;
    isMarketplace: boolean;
    link: string | null
  }) => Promise<void>;
  defaultStore: StoreType;
}

export function AddItemModal({ isOpen, onClose, onAdd, defaultStore }: AddItemModalProps) {
  const [mode, setMode] = useState<'regular' | 'marketplace'>('regular');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('шт');
  const [isUnitOpen, setIsUnitOpen] = useState(false);
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
        unit: mode === 'regular' ? unit : null,
        store: mode === 'marketplace' ? 'Маркетплейсы' : store,
        isMarketplace: mode === 'marketplace',
        link: mode === 'marketplace' ? link : null,
      });
      setName('');
      setQuantity(1);
      setUnit('шт');
      setLink('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableStores = STORES.filter(s => s !== 'ПЛАН' && s !== 'Маркетплейсы');

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Название</label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Молоко"
                  className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-brand-violet transition-all"
                />
              </div>

              {mode === 'regular' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Количество</label>
                      <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-xl shadow-sm active:scale-90 transition-transform"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-bold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-xl shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Ед. изм.</label>
                      <button
                        type="button"
                        onClick={() => setIsUnitOpen(!isUnitOpen)}
                        className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-bold flex items-center justify-between"
                      >
                        {unit}
                        <ChevronDown className={clsx("w-4 h-4 transition-transform", isUnitOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isUnitOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden z-20"
                          >
                            {UNITS.map(u => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => {
                                  setUnit(u);
                                  setIsUnitOpen(false);
                                }}
                                className={clsx(
                                  "w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium",
                                  unit === u && "text-brand-violet font-bold"
                                )}
                              >
                                {u}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Выбери магазин</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                      {availableStores.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStore(s)}
                          className={clsx(
                            "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all active:scale-95",
                            store === s
                              ? "bg-brand-violet border-brand-violet text-white shadow-lg shadow-brand-violet/20"
                              : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Ссылка на товар</label>
                  <input
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Вставьте ссылку на товар"
                    className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-brand-violet transition-all"
                  />
                </div>
              )}

              <button
                disabled={loading}
                className="w-full py-4 bg-brand-violet text-white font-bold rounded-2xl shadow-lg shadow-brand-violet/20 disabled:opacity-50 transition-transform active:scale-[0.98] mt-2"
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
