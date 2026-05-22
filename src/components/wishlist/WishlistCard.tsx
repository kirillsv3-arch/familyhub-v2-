'use client';

import { WishlistItem, User, SavingGoal } from '@/types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Edit2, Gift, PiggyBank, Link as LinkIcon, Lock, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { Confetti } from './Confetti';
import { Snackbar } from './Snackbar';

interface WishlistCardProps {
  item: WishlistItem;
  currentUser: User;
  partner?: User | null;
  onUpdate: (id: string, data: Partial<WishlistItem> & { createTransaction?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (item: WishlistItem) => void;
  onCreateGoal: (item: WishlistItem) => void;
  savingGoal?: SavingGoal;
}

export function WishlistCard({
  item,
  currentUser,
  partner,
  onUpdate,
  onDelete,
  onEdit,
  onCreateGoal,
  savingGoal
}: WishlistCardProps) {
  const isOwner = item.authorId === currentUser.uid;
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingComplete, setIsConfirmingComplete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTransactionSnackbar, setShowTransactionSnackbar] = useState(false);

  // Swipe logic
  const x = useMotionValue(0);
  const swipeThreshold = 80;
  const backgroundOpacity = useTransform(x, [-swipeThreshold, 0, swipeThreshold], [1, 0, 1]);
  const leftActionOpacity = useTransform(x, [40, swipeThreshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [-swipeThreshold, -40], [1, 0]);

  const handleDragEnd = async (_: any, info: any) => {
    if (item.isCompleted) return;

    // Swipe Right (x > 0) for non-owner: Trigger Fulfill
    if (info.offset.x > swipeThreshold && !isOwner) {
        setIsConfirmingComplete(true);
        x.set(0);
        return;
    }

    // Swipe Left (x < 0) for owner: Open menu
    if (info.offset.x < -swipeThreshold && isOwner) {
        setIsMenuOpen(true);
        x.set(-120);
        return;
    }

    // Reset if didn't reach threshold or other cases
    setIsMenuOpen(false);
    x.set(0);
  };

  const handleComplete = async (createTransaction: boolean = false) => {
    setShowConfetti(true);
    setIsConfirmingComplete(false);

    setTimeout(async () => {
      await onUpdate(item.id, {
        isCompleted: true,
        createTransaction
      });
      setShowConfetti(false);

      if (!createTransaction && item.type === 'material' && item.price) {
          setShowTransactionSnackbar(true);
      }
    }, 2000);
  };

  const handleReserve = async () => {
      const newReservedBy = item.reservedBy === currentUser.uid ? null : currentUser.uid;
      await onUpdate(item.id, { reservedBy: newReservedBy });
  };

  const getDeterministicColor = (title: string) => {
    const firstChar = title.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    ];
    return colors[charCode % colors.length];
  };

  const colorClass = getDeterministicColor(item.title);

  const cardContent = (
    <div className={`h-full flex flex-col rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 ${!item.imageUrl ? colorClass.split(' ')[0] : 'bg-white dark:bg-zinc-900'}`}>
      {item.imageUrl ? (
        <>
          <div className="h-2/3 relative">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            {item.type === 'non-material' && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                ✨ Нематериальное
              </div>
            )}
            {item.reservedBy && (
                <div className="absolute top-2 right-2 p-1.5 bg-brand-violet text-white rounded-full shadow-lg">
                    <Lock className="w-3 h-3" />
                </div>
            )}
          </div>
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
              {item.note && <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{item.note}</p>}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {item.price && <span className="text-xs font-bold">{item.price} ₽</span>}
                {item.link && <LinkIcon className="w-3 h-3 text-zinc-400" onClick={(e) => { e.stopPropagation(); window.open(item.link, '_blank'); }} />}
              </div>
              {item.type === 'material' && item.price && (
                <button
                    onClick={(e) => { e.stopPropagation(); onCreateGoal(item); }}
                    className={`p-1.5 rounded-lg transition-colors ${item.linkedSavingGoalId ? 'bg-brand-violet text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                >
                  <PiggyBank className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                {item.reservedBy && <Lock className="w-4 h-4 mt-1 opacity-50" />}
             </div>
             {item.type === 'non-material' && (
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">✨ Нематериальное</span>
            )}
            {item.note && <p className="text-sm opacity-70 line-clamp-3 mt-2">{item.note}</p>}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {item.price && <span className="font-bold">{item.price} ₽</span>}
              {item.link && <LinkIcon className="w-4 h-4 opacity-50" onClick={(e) => { e.stopPropagation(); window.open(item.link, '_blank'); }} />}
            </div>
            {item.type === 'material' && item.price && (
                <button
                    onClick={(e) => { e.stopPropagation(); onCreateGoal(item); }}
                    className={`p-2 rounded-xl transition-colors ${item.linkedSavingGoalId ? 'bg-brand-violet text-white' : 'bg-black/5 dark:bg-white/5'}`}
                >
                    <PiggyBank className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group h-[240px]"
    >
      {/* Background Actions */}
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 rounded-2xl flex items-center justify-between px-6 overflow-hidden"
      >
        <motion.div style={{ opacity: leftActionOpacity }} className="flex items-center gap-2 text-brand-emerald">
          <Gift className="w-6 h-6" />
          <span className="font-bold">Исполнить</span>
        </motion.div>
        <motion.div style={{ opacity: rightActionOpacity }} className="flex items-center gap-4 text-zinc-400">
           <Edit2 className="w-6 h-6" onClick={() => onEdit(item)} />
           <Trash2 className="w-6 h-6 text-red-500" onClick={() => setIsDeleting(true)} />
        </motion.div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        drag={!item.isCompleted ? "x" : false}
        dragConstraints={{ left: isOwner ? -120 : 0, right: isOwner ? 120 : 120 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onLongPress={() => !isOwner && !item.isCompleted && handleReserve()}
        onClick={() => { if(isMenuOpen) { setIsMenuOpen(false); x.set(0); } }}
        className="relative z-10 h-full touch-pan-y"
      >
        {cardContent}

        {item.isCompleted && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-brand-emerald text-white rounded-full flex items-center justify-center mb-2">
                    <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm">Исполнено!</p>
                {item.completedBy && (
                    <p className="text-[10px] text-zinc-500 mt-1">От: {item.completedBy === currentUser.uid ? 'Вас' : partner?.name || 'Партнера'}</p>
                )}
            </div>
        )}
      </motion.div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {isConfirmingComplete && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-xs text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-brand-violet/10 text-brand-violet rounded-full flex items-center justify-center mx-auto">
                        <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">Исполнить желание?</h3>
                    <p className="text-sm text-zinc-500">Это действие нельзя отменить. {partner?.name} будет в восторге!</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsConfirmingComplete(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl">Нет</button>
                        <button onClick={() => handleComplete()} className="flex-1 py-3 bg-brand-violet text-white font-bold rounded-xl">Да!</button>
                    </div>
                </motion.div>
            </div>
        )}

        {isDeleting && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-xs text-center space-y-4"
                >
                    <h3 className="text-xl font-bold">Удалить?</h3>
                    <p className="text-sm text-zinc-500">Вы уверены, что хотите удалить это желание из списка?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl">Отмена</button>
                        <button
                            onClick={() => { onDelete(item.id); setIsDeleting(false); }}
                            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl"
                        >
                            Удалить
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {showConfetti && <Confetti />}

      <Snackbar
        isOpen={showTransactionSnackbar}
        message="Записать трату в Деньги?"
        onClose={() => setShowTransactionSnackbar(false)}
        onConfirm={async () => {
            await onUpdate(item.id, { createTransaction: true });
            setShowTransactionSnackbar(false);
        }}
      />
    </motion.div>
  );
}
