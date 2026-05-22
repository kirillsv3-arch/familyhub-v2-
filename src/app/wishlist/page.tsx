'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { WishlistItem, User, Family, SavingGoal } from '@/types';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import { AddWishModal } from '@/components/wishlist/AddWishModal';
import { SavingGoalModal } from '@/components/wishlist/SavingGoalModal';
import { Plus, ArrowLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function WishlistPage() {
  const { data: user } = useSWR<User>('/api/auth/me', fetcher);
  const { data: family } = useSWR<Family>('/api/family', fetcher);
  const { data: items, mutate } = useSWR<WishlistItem[]>('/api/wishlist', fetcher);
  const { data: savingGoals } = useSWR<SavingGoal[]>('/api/saving-goals', fetcher);
  const { data: members } = useSWR<User[]>('/api/family/members', fetcher);

  const [activeMemberTab, setActiveMemberTab] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<'want' | 'got'>('want');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>();
  const [goalModalData, setGoalModalData] = useState<{ item: WishlistItem; goal?: SavingGoal } | null>(null);

  // Filtering & Sorting
  const [typeFilter, setTypeFilter] = useState<'all' | 'material' | 'non-material'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'expensive' | 'cheap' | 'saving'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const currentUserId = user?.uid;
  const partner = members?.find(m => m.uid !== currentUserId);
  const sortedMembers = useMemo(() => {
    if (!members || !currentUserId) return [];
    return [...members].sort((a, b) => a.uid === currentUserId ? -1 : 1).slice(0, 2);
  }, [members, currentUserId]);

  const activeTabId = activeMemberTab || currentUserId;

  const filteredItems = useMemo(() => {
    if (!items || !activeTabId) return [];

    let result = items.filter(item => {
        const belongsToTab = item.authorId === activeTabId;
        const correctSegment = activeSegment === 'got' ? item.isCompleted : !item.isCompleted;
        const matchesFilter = typeFilter === 'all' || item.type === typeFilter;
        return belongsToTab && correctSegment && matchesFilter;
    });

    result.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime();
        if (sortBy === 'expensive') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'cheap') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'saving') return (b.linkedSavingGoalId ? 1 : 0) - (a.linkedSavingGoalId ? 1 : 0);
        return 0;
    });

    return result;
  }, [items, activeTabId, activeSegment, typeFilter, sortBy]);

  const handleAdd = async (data: any) => {
    const method = editingItem ? 'PATCH' : 'POST';
    const url = editingItem ? `/api/wishlist/${editingItem.id}` : '/api/wishlist';

    // Optimistic UI
    const newItem = { ...data, id: editingItem?.id || 'temp', authorId: currentUserId, isCompleted: false, createdAt: new Date().toISOString() };
    mutate(prev => editingItem
        ? prev?.map(i => i.id === editingItem.id ? { ...i, ...data } : i)
        : [newItem, ...(prev || [])], false);

    const res = await fetch(url, {
      method,
      body: JSON.stringify(data),
    });
    if (res.ok) mutate();
  };

  const handleUpdate = async (id: string, data: Partial<WishlistItem>) => {
    mutate(prev => prev?.map(i => i.id === id ? { ...i, ...data } : i), false);
    const res = await fetch(`/api/wishlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res.ok) mutate();
  };

  const handleDelete = async (id: string) => {
    mutate(prev => prev?.filter(i => i.id !== id), false);
    const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
    if (res.ok) mutate();
  };

  const handleCreateGoal = async (data: any) => {
    if (!goalModalData) return;
    const res = await fetch('/api/saving-goals', {
      method: 'POST',
      body: JSON.stringify({ ...data, wishId: goalModalData.item.id }),
    });
    if (res.ok) mutate();
  };

  const hasBothTypes = useMemo(() => {
    const tabItems = items?.filter(i => i.authorId === activeTabId && (activeSegment === 'got' ? i.isCompleted : !i.isCompleted));
    const hasMaterial = tabItems?.some(i => i.type === 'material');
    const hasNonMaterial = tabItems?.some(i => i.type === 'non-material');
    return hasMaterial && hasNonMaterial;
  }, [items, activeTabId, activeSegment]);

  const gridCols = filteredItems.some(i => i.imageUrl) ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <main className="min-h-screen pb-32">
      {/* Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">Вишлисты</h1>
        </div>
      </div>

      {/* Member Tabs */}
      <div className="flex px-6 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {sortedMembers.map((m) => {
            const activeCount = items?.filter(i => i.authorId === m.uid && !i.isCompleted).length || 0;
            const isActive = activeTabId === m.uid;
            return (
                <button
                    key={m.uid}
                    onClick={() => setActiveMemberTab(m.uid)}
                    className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-all whitespace-nowrap ${
                        isActive ? 'border-brand-violet text-foreground font-bold' : 'border-transparent text-zinc-400'
                    }`}
                >
                    {m.name === user?.name ? 'Мой список' : m.name}
                    {activeCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-violet text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                            {activeCount}
                        </span>
                    )}
                </button>
            );
        })}
      </div>

      {/* Segment Control & Filter/Sort */}
      <div className="px-6 mt-6 flex items-center justify-between gap-4">
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex-1 max-w-[240px]">
            <button
                onClick={() => setActiveSegment('want')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeSegment === 'want' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}
            >
                Хочу
            </button>
            <button
                onClick={() => setActiveSegment('got')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeSegment === 'got' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'}`}
            >
                Получил(а)
            </button>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`p-2 rounded-xl transition-colors ${sortBy !== 'newest' ? 'bg-brand-violet/10 text-brand-violet' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'}`}
            >
                <ArrowUpDown className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Type Chips */}
      {hasBothTypes && (
          <div className="px-6 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {['all', 'material', 'non-material'].map((t) => (
                <button
                    key={t}
                    onClick={() => setTypeFilter(t as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        typeFilter === t ? 'bg-brand-violet text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                    }`}
                >
                    {t === 'all' ? 'Все' : t === 'material' ? 'Материальное' : 'Нематериальное'}
                </button>
            ))}
          </div>
      )}

      {/* Content */}
      <div className={`px-6 mt-6 grid gap-4 ${gridCols}`}>
        <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
                <WishlistCard
                    key={item.id}
                    item={item}
                    currentUser={user!}
                    partner={partner}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onEdit={(item) => { setEditingItem(item); setIsAddModalOpen(true); }}
                    onCreateGoal={(item) => {
                        const goal = savingGoals?.find(g => g.id === item.linkedSavingGoalId);
                        setGoalModalData({ item, goal });
                    }}
                    savingGoal={savingGoals?.find(g => g.id === item.linkedSavingGoalId)}
                />
            ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
                {activeTabId === currentUserId ? (
                    <>
                        <div className="text-4xl">✨</div>
                        <p className="text-zinc-500">Что тебе хочется? Добавь первое желание</p>
                        <button
                            onClick={() => { setEditingItem(undefined); setIsAddModalOpen(true); }}
                            className="px-6 py-3 bg-brand-violet text-white font-bold rounded-2xl"
                        >
                            Добавить
                        </button>
                    </>
                ) : activeSegment === 'want' ? (
                    <p className="text-zinc-500">У {partner?.name || 'партнера'} пока нет желаний</p>
                ) : (
                    <p className="text-zinc-500">Пока ничего не исполнено — но всё впереди</p>
                )}
            </div>
        )}
      </div>

      {/* FAB */}
      {activeTabId === currentUserId && (
          <div className="fixed bottom-24 right-6">
            <button
                onClick={() => { setEditingItem(undefined); setIsAddModalOpen(true); }}
                className="w-16 h-16 bg-brand-violet text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/30 active:scale-95 transition-transform"
            >
                <Plus className="w-10 h-10" />
            </button>
          </div>
      )}

      {/* Modals */}
      <AddWishModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingItem(undefined); }}
        onAdd={handleAdd}
        initialData={editingItem}
      />

      <SavingGoalModal
        isOpen={!!goalModalData}
        onClose={() => setGoalModalData(null)}
        onCreate={handleCreateGoal}
        initialTitle={goalModalData?.item.title}
        initialAmount={goalModalData?.item.price}
        existingGoal={goalModalData?.goal}
      />

      {/* Sort Menu */}
      <AnimatePresence>
        {showSortMenu && (
            <>
                <div className="fixed inset-0 z-[150]" onClick={() => setShowSortMenu(false)} />
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed bottom-24 left-6 right-6 bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-2xl z-[151] border border-zinc-100 dark:border-zinc-800"
                >
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Сортировка</p>
                    <div className="space-y-1">
                        {[
                            { id: 'newest', label: 'Сначала новые' },
                            { id: 'oldest', label: 'Сначала старые' },
                            { id: 'expensive', label: 'Дорогие сверху' },
                            { id: 'cheap', label: 'Дешевые сверху' },
                            { id: 'saving', label: 'Сначала с копилкой' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => { setSortBy(s.id as any); setShowSortMenu(false); }}
                                className={`w-full text-left p-3 rounded-xl font-bold transition-colors ${sortBy === s.id ? 'bg-brand-violet text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </main>
  );
}
