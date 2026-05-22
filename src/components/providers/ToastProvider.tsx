'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={clsx(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border w-full max-w-xs",
                toast.type === 'success' && "bg-zinc-900 text-white border-zinc-800",
                toast.type === 'error' && "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
              )}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="flex-1 text-sm font-bold">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="p-1 opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
