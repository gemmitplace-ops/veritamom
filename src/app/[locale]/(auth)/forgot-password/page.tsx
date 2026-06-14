'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}>
                <span className="text-2xl">📬</span>
              </div>
              <h1 className="font-serif text-xl mb-2" style={{ color: '#8B1A2B' }}>Check your inbox</h1>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link href="/sign-in" className="text-sm font-medium hover:underline" style={{ color: '#8B1A2B' }}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-xl mb-1" style={{ color: '#8B1A2B' }}>Forgot your password?</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#8B1A2B' }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                Remember it?{' '}
                <Link href="/sign-in" className="font-medium hover:underline" style={{ color: '#8B1A2B' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
