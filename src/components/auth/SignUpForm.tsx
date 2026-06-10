'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export function SignUpForm() {
  const t = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', username: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name, username: form.username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t(`auth.errors.${data.error}` as never) || t('auth.errors.generic'));
        return;
      }
      router.push('/onboarding');
    } catch {
      setError(t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'name', type: 'text', label: 'auth.name' },
    { key: 'username', type: 'text', label: 'auth.username' },
    { key: 'email', type: 'email', label: 'auth.email' },
    { key: 'password', type: 'password', label: 'auth.password' },
    { key: 'confirmPassword', type: 'password', label: 'auth.confirmPassword' },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-brand-crimson mb-2">{t('auth.signUpTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('auth.signUpSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, type, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t(label as never)}
            </label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
            />
          </div>
        ))}

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
          {loading ? t('common.loading') : t('nav.signUp')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link href="/sign-in" className="text-brand-crimson hover:underline font-medium">
          {t('nav.signIn')}
        </Link>
      </p>
    </div>
  );
}
