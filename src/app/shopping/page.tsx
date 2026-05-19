'use client';

import { useState, useEffect, useMemo } from 'react';
import { StoreType, ShoppingItem } from '@/types';
import { StoreTabs } from '@/components/shopping/StoreTabs';
import { ShoppingItemCard } from '@/components/shopping/ShoppingItemCard';
import { AddItemModal } from '@/components/shopping/AddItemModal';
import { PriceInputModal } from '@/components/shopping/PriceInputModal';
import { ShoppingListSkeleton } from '@/components/shopping/Skeletons';
import { Plus, Trash2, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ShoppingPage() {
  const [activeTab, setActiveTab] = useState<StoreType>('ПЛАН');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [priceModalData, setPriceModalData] = useState<{ id: string; name: string; store: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/shopping');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (itemData: { name: string; quantity: string | null; store: StoreType; isMarketplace: boolean; link: string | null }) => {
    const res = await fetch('/api/shopping', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    if (res.ok) {
      fetchItems();
    }
  };

  const handleToggle = async (id: string, isBought: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, isBought } : item));

    if (isBought) {
      const item = items.find(i => i.id === id);
      if (item && !item.isMarketplace) {
        // Show price modal
        setPriceModalData({ id, name: item.name, store: item.store });
        checkStoreNotification(item.store);
      }
    }

    const res = await fetch(`/api/shopping/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isBought }),
    });
    if (!res.ok) fetchItems();
  };

  const handlePriceSubmit = async (price: number) => {
    if (!priceModalData) return;
    const res = await fetch(`/api/shopping/${priceModalData.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ price }),
    });
    if (res.ok) {
      fetchItems();
    }
  };

  const handleArchive = async () => {
    if (!confirm('Удалить все купленные товары?')) return;
    const res = await fetch('/api/shopping/archive', { method: 'POST' });
    if (res.ok) {
      fetchItems();
    }
  };

  const checkStoreNotification = (store: string) => {
    const lastNotified = localStorage.getItem('last_store_notification');
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (!lastNotified || now - parseInt(lastNotified) > cooldown) {
      if (confirm(`Похоже, ты в магазине "${store}". Оповестить партнера?`)) {
        fetch('/api/shopping/notify', { method: 'POST' });
      }
      localStorage.setItem('last_store_notification', now.toString());
    }
  };

  const filteredItems = useMemo(() => {
    const base = items;
    if (activeTab === 'ПЛАН') {
      const regular = base.filter(i => !i.isMarketplace).sort((a, b) => Number(a.isBought) - Number(b.isBought));
      const marketplace = base.filter(i => i.isMarketplace).sort((a, b) => Number(a.isBought) - Number(b.isBought));
      return { regular, marketplace };
    } else if (activeTab === 'Маркетплейсы') {
      return { regular: [], marketplace: base.filter(i => i.isMarketplace).sort((a, b) => Number(a.isBought) - Number(b.isBought)) };
    } else {
      return { regular: base.filter(i => i.store === activeTab).sort((a, b) => Number(a.isBought) - Number(b.isBought)), marketplace: [] };
    }
  }, [items, activeTab]);

  const hasBoughtItems = items.some(i => i.isBought);

  return (
    <main className="min-h-screen pb-32">
      <div className="flex justify-between items-center p-6 pb-2">
        <h1 className="text-2xl font-bold">Список покупок</h1>
        <Link href="/shopping/stats" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <BarChart3 className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
        </Link>
      </div>

      <StoreTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="px-6 mt-4 space-y-4">
        {loading ? (
          <ShoppingListSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredItems.regular.map(item => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
              />
            ))}

            {activeTab === 'ПЛАН' && filteredItems.marketplace.length > 0 && (
              <motion.div layout className="py-4 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Маркетплейсы</span>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </motion.div>
            )}

            {filteredItems.marketplace.map(item => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onOpenLink={(link) => window.open(link, '_blank')}
              />
            ))}

            {hasBoughtItems && (
              <motion.div layout className="pt-8 pb-4">
                <button
                  onClick={handleArchive}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-900 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-transform"
                >
                  <Trash2 className="w-5 h-5" />
                  Удалить купленное
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {!loading && filteredItems.regular.length === 0 && filteredItems.marketplace.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p>Список пуст</p>
            <p className="text-xs">Нажмите +, чтобы добавить товар</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6 pointer-events-none">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-16 h-16 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/30 pointer-events-auto active:scale-95 transition-transform"
        >
          <Plus className="w-10 h-10" />
        </button>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
        defaultStore={activeTab}
      />

      <PriceInputModal
        isOpen={!!priceModalData}
        onClose={() => setPriceModalData(null)}
        onSubmit={handlePriceSubmit}
        itemName={priceModalData?.name || ''}
        store={priceModalData?.store || ''}
      />
    </main>
  );
}
