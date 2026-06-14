'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') ?? '';
    setToken(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/sign-in'), 2500);
    } else {
      const data = await res.json();
      setError(data.error === 'Token expired or invalid'
        ? 'This link has expired or already been used. Please request a new one.'
        : 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F3' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="block font-serif font-bold" style={{ color: '#8B1A2B', fontSize: '24px' }}>
            {locale === 'zh' ? '薇理妈咪' : 'VERITAMOM'}
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.17em] mt-1" style={{ color: '#C9A84C' }}>
            {locale === 'zh' ? '母婴健康的黄金标准' : 'The Gold Standard in Maternal Intelligence'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}>
                <span className="text-2xl">✅</span>
              </div>
              <h1 className="font-serif text-xl mb-2" style={{ color: '#8B1A2B' }}>Password updated</h1>
              <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-xl mb-1" style={{ color: '#8B1A2B' }}>Set a new password</h1>
              <p className="text-sm text-gray-500 mb-6">Choose a strong password of at least 8 characters.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
                {error.includes('expired') && (
                  <Link href="/forgot-password" className="block text-xs font-medium hover:underline" style={{ color: '#8B1A2B' }}>
                    Request a new reset link →
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#8B1A2B' }}
                >
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
