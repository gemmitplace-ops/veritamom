'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';

const categories = ['QUESTION', 'WIN', 'CONCERN', 'PRODUCT_REVIEW', 'RECIPE'];

export function NewPostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('QUESTION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const localeMap: Record<string, string> = { en: 'EN', zh: 'ZH', ko: 'KO' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, category, language: localeMap[locale] || 'EN' }),
      });
      if (!res.ok) throw new Error('Failed to post');
      onSuccess();
      onClose();
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-lg">{t('community.writePost')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('community.postCategory')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[44px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('community.postTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('community.postBody')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={10}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark disabled:opacity-50 min-h-[44px]"
          >
            {loading ? t('common.loading') : t('community.publishPost')}
          </button>
        </form>
      </div>
    </div>
  );
}
