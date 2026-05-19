'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';

const authSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().min(2, 'Имя слишком короткое').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    // Generate a random CSRF token
    const csrfToken = Math.random().toString(36).substring(2);
    Cookies.set('fb-csrf', csrfToken, { secure: true, sameSite: 'lax' });
  }, []);

  const onSubmit = async (data: AuthFormData) => {
    setError(null);
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        if (!data.name) {
          setError('Имя обязательно при регистрации');
          setLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

        // Register user in our Firestore via API
        const idToken = await userCredential.user.getIdToken();
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, name: data.name, email: data.email }),
        });
      }

      const idToken = await userCredential.user.getIdToken();
      const csrfToken = Cookies.get('fb-csrf');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, csrfToken }),
      });

      if (response.ok) {
        router.refresh();
        router.push('/');
      } else {
        setError('Ошибка аутентификации на сервере');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-violet">FamilyHub</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {isLogin ? 'С возвращением!' : 'Создайте аккаунт для вашей семьи'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand-violet outline-none transition-all"
                  placeholder="Иван Иванов"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand-violet outline-none transition-all"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-brand-violet outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-violet text-white font-semibold rounded-xl hover:bg-violet-600 focus:ring-4 focus:ring-violet-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-brand-violet transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
}
