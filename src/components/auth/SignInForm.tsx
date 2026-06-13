'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';

export function SignInForm() {
  const t = useTranslations();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setError(t(`auth.errors.${msg}` as never) || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-brand-crimson mb-2">{t('auth.signInTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('auth.signInSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
          />
          <div className="flex justify-end mt-1">
            <Link href="/forgot-password" className="text-xs text-brand-crimson hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {loading ? t('common.loading') : t('nav.signIn')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('auth.dontHaveAccount')}{' '}
        <Link href="/sign-up" className="text-brand-crimson hover:underline font-medium">
          {t('nav.signUp')}
        </Link>
      </p>
    </div>
  );
}
