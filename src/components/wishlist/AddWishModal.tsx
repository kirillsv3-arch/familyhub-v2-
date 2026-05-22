'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { WishType, WishlistItem } from '@/types';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  initialData?: WishlistItem;
}

export function AddWishModal({ isOpen, onClose, onAdd, initialData }: AddWishModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WishType>('material');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setPrice(initialData.price?.toString() || '');
      setLink(initialData.link || '');
      setImageUrl(initialData.imageUrl || '');
      setNote(initialData.note || '');
      setImagePreview(initialData.imageUrl || '');
    } else {
      setTitle('');
      setType('material');
      setPrice('');
      setLink('');
      setImageUrl('');
      setNote('');
      setImagePreview('');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setImagePreview(imageUrl);
    }, 300);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (type === 'material' && !price)) return;

    setLoading(true);
    try {
      await onAdd({
        title,
        type,
        price: type === 'material' ? parseFloat(price) : null,
        link,
        imageUrl,
        note,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title && (type === 'non-material' || price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-950 rounded-t-[32px] z-[101] shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{initialData ? 'Редактировать желание' : 'Новое желание'}</h2>
                <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pb-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 ml-1">Что ты хочешь?</label>
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название желания..."
                    className="w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 ml-1">Тип</label>
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('material')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                        type === 'material' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'
                      }`}
                    >
                      Материальное
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('non-material')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                        type === 'non-material' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500'
                      }`}
                    >
                      Нематериальное
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {type === 'material' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-500 ml-1">Примерная цена (₽)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0"
                          className="w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none"
                          required={type === 'material'}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-500 ml-1">Ссылка</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-4 pl-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 ml-1">Картинка (URL)</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Ссылка на изображение..."
                        className="w-full p-4 pl-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none"
                      />
                    </div>
                    {imagePreview && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 ml-1">Заметка</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Добавь подробности..."
                    rows={3}
                    className="w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none focus:ring-2 focus:ring-brand-violet outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full py-4 bg-brand-violet text-white font-bold rounded-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                >
                  {loading ? 'Сохранение...' : initialData ? 'Обновить' : 'Добавить'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
