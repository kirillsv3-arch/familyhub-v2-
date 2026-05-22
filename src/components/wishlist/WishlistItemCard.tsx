'use client';

import { WishlistItem } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { ExternalLink, MoreVertical, Pencil, Trash2, CalendarRange } from 'lucide-react';
import { useState } from 'react';

interface WishlistItemCardProps {
  item: WishlistItem;
  isOwner: boolean;
  onEdit?: (item: WishlistItem) => void;
  onDelete?: (id: string) => void;
}

export function WishlistItemCard({ item, isOwner, onEdit, onDelete }: WishlistItemCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm relative group">
      <div className="flex justify-between items-start mb-3">
        <PriorityBadge priority={item.priority} />
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 z-20 py-1 overflow-hidden">
                  <button
                    onClick={() => {
                      onEdit?.(item);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                  >
                    <Pencil className="w-4 h-4" />
                    Изменить
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(item.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
        {item.price && (
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {item.price.toLocaleString('ru-RU')} ₽
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Посмотреть
          </a>
        ) : (
          <div className="flex-1 h-9" />
        )}

        <button
          onClick={() => alert('Запланировано (заглушка)')}
          className="flex items-center justify-center gap-2 py-2 px-3 text-brand-violet hover:bg-brand-violet/5 rounded-xl text-sm font-semibold transition-colors"
          title="Запланировать покупку"
        >
          <CalendarRange className="w-5 h-5" />
          <span className="sr-only">Запланировать</span>
        </button>
      </div>
    </div>
  );
}
