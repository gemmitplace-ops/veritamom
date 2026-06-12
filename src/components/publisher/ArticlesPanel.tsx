'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PenLine, Plus, Trash2, Eye, EyeOff, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { ArticleEditor } from './ArticleEditor';

// Must stay assignable to ArticleEditor's Article — the panel hands articles
// straight to the editor. /api/admin/articles returns full rows.
interface Article {
  id: string;
  slug: string;
  title: string;
  hook: string;
  tldr: string;
  body: string;
  metaDescription?: string;
  confidenceLevel: 'ESTABLISHED' | 'EMERGING' | 'DEBATED';
  trimesterRelevance: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  viewCount: number;
  author: { name: string };
  citations: Array<{
    paper: { id: string; title: string; citation: string; journalName: string; publishedYear: number };
    note?: string | null;
  }>;
}

const confIcons = {
  ESTABLISHED: CheckCircle,
  EMERGING: TrendingUp,
  DEBATED: AlertCircle,
};
const confColors = { ESTABLISHED: '#2d7a4f', EMERGING: '#b45309', DEBATED: '#7c3aed' };

export function ArticlesPanel() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | 'new' | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/articles');
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(article: Article) {
    await fetch(`/api/articles/${article.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !article.isPublished }),
    });
    load();
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Delete "${article.title}"?`)) return;
    await fetch(`/api/articles/${article.slug}`, { method: 'DELETE' });
    load();
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PUBLISHER')) {
    return <p className="text-gray-500">Access denied.</p>;
  }

  if (editing !== null) {
    return (
      <ArticleEditor
        article={editing === 'new' ? null : editing}
        onSave={() => { setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PenLine size={20} style={{ color: '#8B1A2B' }} />
          <h1 className="font-serif text-2xl font-bold" style={{ color: '#8B1A2B' }}>Articles</h1>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#8B1A2B' }}
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200">
          <PenLine size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-1">No articles yet</p>
          <p className="text-sm text-gray-400">Click "New Article" to write your first mom-friendly guide.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => {
            const ConfIcon = confIcons[article.confidenceLevel];
            return (
              <div
                key={article.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${article.isPublished ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {article.isFeatured && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold-dark border border-brand-gold/30">Featured</span>
                    )}
                    <ConfIcon size={12} style={{ color: confColors[article.confidenceLevel] }} />
                  </div>
                  <p className="text-xs text-gray-400 mb-0.5">{article.hook}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">{article.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {article.citations.length} sources · {article.viewCount} views
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditing(article)}
                    className="p-2 rounded-lg text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5 transition-colors"
                    title="Edit"
                  >
                    <PenLine size={15} />
                  </button>
                  <button
                    onClick={() => togglePublish(article)}
                    className="p-2 rounded-lg text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5 transition-colors"
                    title={article.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {article.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
