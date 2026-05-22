'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number) => Promise<void>;
  itemName: string;
  store: string;
}

export function PriceInputModal({ isOpen, onClose, onSubmit, itemName, store }: PriceInputModalProps) {
  const [price, setPrice] = useState('');
  const [suggestions, setSuggestions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && itemName) {
      fetch(`/api/shopping/stats?name=${encodeURIComponent(itemName)}&store=${encodeURIComponent(store)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const prices = data.map((h: { price: number }) => h.price);
            const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
            setSuggestions([avg]);
          }
        });
    } else {
      setPrice('');
      setSuggestions([]);
    }
  }, [isOpen, itemName, store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;
    setLoading(true);
    try {
      await onSubmit(parseFloat(price));
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xs bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold mb-1 text-center">Сколько это стоило?</h3>
            <p className="text-sm text-zinc-500 text-center mb-6">{itemName}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-center text-3xl font-bold p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-brand-emerald"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">₽</span>
              </div>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrice(s.toString())}
                      className="px-4 py-2 bg-brand-emerald/10 text-brand-emerald text-sm font-bold rounded-xl hover:bg-brand-emerald/20 transition-colors"
                    >
                      Средняя: {s} ₽
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl"
                >
                  Пропустить
                </button>
                <button
                  disabled={!price || loading}
                  className="py-3 bg-brand-emerald text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {loading ? "..." : "Ок"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
