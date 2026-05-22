'use client';

import { useState, useEffect } from 'react';
import { User, WishlistItem } from '@/types';
import { WishlistTabs } from '@/components/wishlist/WishlistTabs';
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { WishlistForm } from '@/components/wishlist/WishlistForm';
import { Plus, Gift, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistClientProps {
  currentUser: User;
  members: { uid: string; name: string }[];
}

export default function WishlistClient({ currentUser, members }: WishlistClientProps) {
  const [activeTab, setActiveTab] = useState(currentUser.uid);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (data: Partial<WishlistItem>) => {
    const url = editingItem ? `/api/wishlist/${editingItem.id}` : '/api/wishlist';
    const method = editingItem ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchItems();
        setIsFormOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Failed to save wishlist item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это желание?')) return;

    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete wishlist item:', error);
    }
  };

  const activeItems = items.filter(item => item.ownerId === activeTab);
  const isMyList = activeTab === currentUser.uid;

  return (
    <main className="p-6 pb-32 min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Вишлисты</h1>
          <p className="text-zinc-500 font-medium">Чем порадовать близких?</p>
        </div>
        {isMyList && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-12 h-12 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-violet/20 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      <WishlistTabs
        tabs={members.map(m => ({ id: m.uid, label: m.uid === currentUser.uid ? 'Мой список' : m.name }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Загружаем желания...</p>
          </div>
        ) : activeItems.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4"
          >
            <AnimatePresence mode='popLayout'>
              {activeItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <WishlistItemCard
                    item={item}
                    isOwner={isMyList}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-zinc-300" />
            </div>
            <div>
              <p className="font-bold text-lg">Список пуст</p>
              <p className="text-sm text-zinc-500">
                {isMyList
                  ? 'Добавьте что-нибудь, чтобы ваши близкие знали, что вам подарить!'
                  : 'Похоже, здесь пока нет идей для подарков.'}
              </p>
            </div>
            {isMyList && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-brand-violet text-white font-bold rounded-xl text-sm"
              >
                Добавить желание
              </button>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <WishlistForm
          item={editingItem || undefined}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </main>
  );
}
