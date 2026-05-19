'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Family } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Moon, Sun, LogOut, Save, Copy, Check } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  family: Family | null;
}

export default function SettingsClient({ user, family }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    caloriesGoal: user.caloriesGoal,
    proteinsGoal: user.proteinsGoal,
    fatsGoal: user.fatsGoal,
    carbsGoal: user.carbsGoal,
    goalType: user.goalType,
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth');
    router.refresh();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (family?.code) {
      navigator.clipboard.writeText(family.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 pb-32 space-y-8">
      <h1 className="text-2xl font-bold">Настройки</h1>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-500">Профиль</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Ваше имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
        </div>
      </section>

      {/* Family Section */}
      {family && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-500">Семья</h2>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Код вашей семьи</p>
              <p className="text-xl font-bold tracking-widest">{family.code}</p>
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </section>
      )}

      {/* Goals Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-500">КБЖУ Цели</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Тип цели</label>
            <select
              value={formData.goalType}
              onChange={(e) => setFormData({ ...formData, goalType: e.target.value as 'maintenance' | 'cutting' | 'bulking' })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            >
              <option value="maintenance">Поддержание</option>
              <option value="cutting">Дефицит</option>
              <option value="bulking">Профицит</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Калории (ккал)</label>
            <input
              type="number"
              value={formData.caloriesGoal}
              onChange={(e) => setFormData({ ...formData, caloriesGoal: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Белки (г)</label>
            <input
              type="number"
              value={formData.proteinsGoal}
              onChange={(e) => setFormData({ ...formData, proteinsGoal: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Жиры (г)</label>
            <input
              type="number"
              value={formData.fatsGoal}
              onChange={(e) => setFormData({ ...formData, fatsGoal: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Углеводы (г)</label>
            <input
              type="number"
              value={formData.carbsGoal}
              onChange={(e) => setFormData({ ...formData, carbsGoal: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
        </div>
      </section>

      {/* Interface Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-500">Интерфейс</h2>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium">Темная тема</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-brand-violet' : 'bg-zinc-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
          </div>
        </button>
      </section>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 p-4 bg-brand-violet text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          Сохранить изменения
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:opacity-90 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
