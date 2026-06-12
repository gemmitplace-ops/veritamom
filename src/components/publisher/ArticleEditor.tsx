'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Search } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  citation: string;
  journalName: string;
  publishedYear: number;
}

interface CitedPaper {
  paperId: string;
  note?: string;
  paper: Paper;
}

interface Article {
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
  citations: Array<{ paper: Paper; note?: string | null }>;
}

interface Props {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ArticleEditor({ article, onSave, onCancel }: Props) {
  const isNew = !article;
  const [saving, setSaving] = useState(false);
  const [paperSearch, setPaperSearch] = useState('');
  const [paperResults, setPaperResults] = useState<Paper[]>([]);
  const [citations, setCitations] = useState<CitedPaper[]>(
    article?.citations.map((c) => ({ paperId: c.paper.id, note: c.note ?? '', paper: c.paper })) ?? []
  );

  const [form, setForm] = useState({
    title: article?.title ?? '',
    hook: article?.hook ?? '',
    tldr: article?.tldr ?? '',
    body: article?.body ?? '',
    metaDescription: article?.metaDescription ?? '',
    confidenceLevel: article?.confidenceLevel ?? 'ESTABLISHED',
    trimesterRelevance: article?.trimesterRelevance ?? 'ALL',
    isPublished: article?.isPublished ?? false,
    isFeatured: article?.isFeatured ?? false,
  });

  useEffect(() => {
    if (!paperSearch.trim()) { setPaperResults([]); return; }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/admin/papers`);
      const data = await res.json();
      const q = paperSearch.toLowerCase();
      setPaperResults((data.papers || []).filter((p: Paper) =>
        p.title.toLowerCase().includes(q) || p.journalName.toLowerCase().includes(q)
      ).slice(0, 6));
    }, 300);
    return () => clearTimeout(timeout);
  }, [paperSearch]);

  function addCitation(paper: Paper) {
    if (citations.find((c) => c.paperId === paper.id)) return;
    setCitations((prev) => [...prev, { paperId: paper.id, note: '', paper }]);
    setPaperSearch('');
    setPaperResults([]);
  }

  function removeCitation(paperId: string) {
    setCitations((prev) => prev.filter((c) => c.paperId !== paperId));
  }

  function updateCitationNote(paperId: string, note: string) {
    setCitations((prev) => prev.map((c) => c.paperId === paperId ? { ...c, note } : c));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      citedPaperIds: citations.map((c) => ({ paperId: c.paperId, note: c.note })),
    };
    const url = isNew ? '/api/articles' : `/api/articles/${article.slug}`;
    const method = isNew ? 'POST' : 'PATCH';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-xl font-bold" style={{ color: '#8B1A2B' }}>
          {isNew ? 'New Article' : 'Edit Article'}
        </h1>
      </div>

      <div className="space-y-5">
        {/* Hook */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            The Question (hook) <span className="text-gray-400 font-normal normal-case tracking-normal">— what moms are actually asking</span>
          </label>
          <input
            type="text"
            value={form.hook}
            onChange={(e) => setForm({ ...form, hook: e.target.value })}
            placeholder="e.g. Is it safe to take Tylenol during pregnancy?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
            required
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Article Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Acetaminophen in Pregnancy: What the Research Actually Says"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
            required
          />
        </div>

        {/* TLDR */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            The Short Answer (TLDR) <span className="text-gray-400 font-normal normal-case tracking-normal">— plain English, 2-3 sentences</span>
          </label>
          <textarea
            value={form.tldr}
            onChange={(e) => setForm({ ...form, tldr: e.target.value })}
            rows={3}
            placeholder="Short, reassuring, evidence-based answer that moms will actually read..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson resize-none"
            required
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Article Body</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={14}
            placeholder="Write the full article here. You can use line breaks. Explain the research, add context, share practical takeaways..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson resize-y font-mono"
            required
          />
        </div>

        {/* Meta description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Meta Description <span className="text-gray-400 font-normal normal-case tracking-normal">— for search engines & AI crawlers (150 chars)</span>
          </label>
          <input
            type="text"
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            maxLength={160}
            placeholder="Brief description for search engines..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
          />
        </div>

        {/* Settings row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confidence Level</label>
            <select
              value={form.confidenceLevel}
              onChange={(e) => setForm({ ...form, confidenceLevel: e.target.value as 'ESTABLISHED' | 'EMERGING' | 'DEBATED' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
            >
              <option value="ESTABLISHED">✓ Established</option>
              <option value="EMERGING">↑ Emerging Research</option>
              <option value="DEBATED">⚡ Actively Debated</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Trimester</label>
            <select
              value={form.trimesterRelevance}
              onChange={(e) => setForm({ ...form, trimesterRelevance: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
            >
              <option value="ALL">All / General</option>
              <option value="FIRST">1st Trimester</option>
              <option value="SECOND">2nd Trimester</option>
              <option value="THIRD">3rd Trimester</option>
              <option value="POSTPARTUM">Postpartum</option>
            </select>
          </div>
        </div>

        {/* Citations */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Cited Research Papers</label>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={paperSearch}
              onChange={(e) => setPaperSearch(e.target.value)}
              placeholder="Search papers to cite..."
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson"
            />
            {paperResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-52 overflow-y-auto mt-1">
                {paperResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addCitation(p)}
                    className="w-full text-left px-3 py-2.5 hover:bg-brand-crimson/5 border-b border-gray-50 last:border-0"
                  >
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.title}</p>
                    <p className="text-[11px] text-gray-400">{p.journalName} · {p.publishedYear}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected citations */}
          <div className="space-y-2">
            {citations.map((c, idx) => (
              <div key={c.paperId} className="flex gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-brand-gold font-bold text-sm flex-shrink-0 w-5">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{c.paper.title}</p>
                  <p className="text-[11px] text-gray-400 mb-1.5">{c.paper.journalName} · {c.paper.publishedYear}</p>
                  <input
                    type="text"
                    value={c.note ?? ''}
                    onChange={(e) => updateCitationNote(c.paperId, e.target.value)}
                    placeholder="Why does this paper support the article? (optional)"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-crimson"
                  />
                </div>
                <button type="button" onClick={() => removeCitation(c.paperId)} className="text-gray-300 hover:text-red-500 flex-shrink-0 text-lg leading-none">&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Publish toggles */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-brand-crimson"
            />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 accent-brand-gold"
            />
            <span className="text-sm text-gray-700">Feature in The Brief</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: '#8B1A2B' }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : isNew ? 'Create Article' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
