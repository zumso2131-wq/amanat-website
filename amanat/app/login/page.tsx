'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Редирект будет выполнен автоматически middleware
      router.push('/cabinet');
      router.refresh();
    } catch (err: any) {
      setError('Произошла ошибка при входе');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">Аманат</h1>
          </Link>
          <p className="text-blue-100">Вход в систему</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Телефон
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (777) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Вернуться на главную
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Тестовые учетные данные:</p>
              <p>Админ: +77771234567 / admin123</p>
              <p>Менеджер: +77771234568 / manager123</p>
              <p>Клиент: +77771234569 / client123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
