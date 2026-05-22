'use client';

import { useState } from 'react';
import { WishlistItem, WishlistPriority } from '@/types';
import { X, Plus } from 'lucide-react';
import { PRIORITY_CONFIG } from './PriorityBadge';

interface WishlistFormProps {
  item?: WishlistItem;
  onSave: (data: Partial<WishlistItem>) => void;
  onClose: () => void;
}

export function WishlistForm({ item, onSave, onClose }: WishlistFormProps) {
  const [name, setName] = useState(item?.name || '');
  const [link, setLink] = useState(item?.link || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [priority, setPriority] = useState<WishlistPriority>(item?.priority || 'want');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    await onSave({
      name,
      link: link || undefined,
      price: price ? parseFloat(price) : undefined,
      priority,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold">{item ? 'Изменить' : 'Новое желание'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">Что хочется?</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название товара или услуги"
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-violet transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Цена (₽)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-violet transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Ссылка</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-violet transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">Приоритет</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRIORITY_CONFIG) as WishlistPriority[]).map((p) => {
                  const config = PRIORITY_CONFIG[p];
                  const Icon = config.icon;
                  const isActive = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-brand-violet bg-brand-violet/5 text-brand-violet'
                          : 'border-transparent bg-zinc-50 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-brand-violet hover:bg-brand-violet/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-violet/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Сохранение...' : item ? 'Обновить' : 'Добавить в вишлист'}
            {!loading && !item && <Plus className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
