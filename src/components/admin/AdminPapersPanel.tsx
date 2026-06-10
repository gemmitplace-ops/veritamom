'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/navigation';
import { Plus, Eye, EyeOff, Sparkles } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  journalName: string;
  publishedYear: number;
  isPublished: boolean;
  summary: string | null;
  createdAt: string;
  tags: Array<{ tag: { name: string } }>;
}

export function AdminPapersPanel() {
  const t = useTranslations();
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', citation: '', journalName: '', publishedYear: new Date().getFullYear(),
    fullPaperUrl: '', tags: '', trimesterRelevance: 'ALL',
    isPublished: false, generateSummaries: true,
  });
  const [saving, setSaving] = useState(false);

  function load() {
    fetch('/api/admin/papers')
      .then((r) => r.json())
      .then((d) => setPapers(d.papers || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      load();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/admin/papers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    });
    load();
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'PUBLISHER') {
    return <div className="text-center py-16 text-gray-500">Access denied.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-brand-crimson">{t('admin.papers')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-crimson text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-crimson-dark min-h-[44px]"
        >
          <Plus size={16} />
          {t('admin.addPaper')}
        </button>
      </div>

      {/* Admin nav */}
      <div className="flex gap-3 mb-6 text-sm">
        <Link href="/publisher/papers" className="text-brand-crimson font-medium border-b-2 border-brand-crimson pb-1">Papers</Link>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-serif text-xl mb-4">{t('admin.addPaper')}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { key: 'title', label: t('admin.paperTitle'), type: 'text' },
                { key: 'citation', label: t('admin.citation'), type: 'text' },
                { key: 'journalName', label: t('admin.journal'), type: 'text' },
                { key: 'publishedYear', label: t('admin.year'), type: 'number' },
                { key: 'fullPaperUrl', label: t('admin.fullPaperUrl'), type: 'url' },
                { key: 'tags', label: `${t('admin.tags')} (comma-separated)`, type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input
                    type={type}
                    value={String(form[key as keyof typeof form])}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? parseInt(e.target.value) : e.target.value }))}
                    required={['title', 'citation', 'journalName'].includes(key)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[44px] text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.trimesterRelevance')}</label>
                <select
                  value={form.trimesterRelevance}
                  onChange={(e) => setForm((f) => ({ ...f, trimesterRelevance: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[44px] text-sm"
                >
                  {['ALL', 'FIRST', 'SECOND', 'THIRD', 'POSTPARTUM'].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.generateSummaries} onChange={(e) => setForm((f) => ({ ...f, generateSummaries: e.target.checked }))} className="rounded" />
                <span className="flex items-center gap-1.5 text-sm"><Sparkles size={14} className="text-brand-gold-dark" /> {t('admin.generateSummaries')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="rounded" />
                <span className="text-sm">{t('admin.publish')} immediately</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-lg text-sm min-h-[44px]">{t('common.cancel')}</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-crimson text-white rounded-lg text-sm font-medium disabled:opacity-50 min-h-[44px]">
                  {saving ? (form.generateSummaries ? t('admin.generating') : t('common.loading')) : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{paper.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{paper.journalName}, {paper.publishedYear}</p>
                {!paper.summary && <p className="text-xs text-orange-500 mt-1">No AI summary yet</p>}
              </div>
              <button
                onClick={() => togglePublish(paper.id, paper.isPublished)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg min-h-[36px] ${paper.isPublished ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
              >
                {paper.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                {paper.isPublished ? 'Published' : 'Draft'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
