'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  duration?: number;
}

export function Snackbar({
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Да',
  cancelText = 'Нет',
  duration = 5000
}: SnackbarProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl z-[300] flex items-center justify-between gap-4 border border-zinc-800"
        >
          <span className="text-sm font-medium">{message}</span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-xl text-xs transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              className="px-4 py-2 bg-brand-violet text-white font-bold rounded-xl text-xs transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
