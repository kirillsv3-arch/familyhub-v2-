'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';

export default function FamilySetupPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateFamily = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/family/create', { method: 'POST' });
      if (response.ok) {
        router.refresh();
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при создании семьи');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Произошла системная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Код должен состоять из 6 символов');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        router.refresh();
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при входе в семью');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Произошла системная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-2">Создание семьи</h1>
      <p className="text-zinc-500 text-center mb-8">
        Вы можете создать новую семью и пригласить партнера, или войти по существующему коду.
      </p>

      {error && (
        <div className="w-full p-3 mb-6 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}

      <div className="w-full space-y-6">
        <button
          onClick={handleCreateFamily}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-4 bg-brand-emerald text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Создать новую семью
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-zinc-500">Или</span>
          </div>
        </div>

        <form onSubmit={handleJoinFamily} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Код семьи</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand-violet outline-none transition-all text-center text-xl font-bold tracking-widest"
              placeholder="ABCDEF"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-3 p-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Users className="w-5 h-5" />
            Войти по коду
          </button>
        </form>
      </div>
    </div>
  );
}
