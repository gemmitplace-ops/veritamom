'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Search, BookOpen, FileText } from 'lucide-react';

interface SearchResult {
  papers: Array<{ id: string; title: string; citation: string; journalName: string; publishedYear: number }>;
  articles: Array<{ id: string; slug: string; title: string; hook: string }>;
}

export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults(null); setOpen(false); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => { setResults(data); setOpen(true); })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = results && (results.papers.length > 0 || results.articles.length > 0);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (hasResults) setOpen(true); }}
        placeholder={t('searchPlaceholder')}
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60 placeholder:text-gray-400 transition-all"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
          {loading && (
            <p className="px-4 py-3 text-xs text-gray-400">Searching…</p>
          )}
          {!loading && !hasResults && query.length >= 2 && (
            <p className="px-4 py-3 text-xs text-gray-400">No results for &ldquo;{query}&rdquo;</p>
          )}
          {!loading && hasResults && (
            <>
              {results!.papers.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Research Papers</p>
                  {results!.papers.map((p) => (
                    <Link
                      key={p.id}
                      href={`/papers/${p.id}` as never}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors"
                    >
                      <BookOpen size={13} className="mt-0.5 flex-shrink-0 text-brand-gold-dark" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" style={{ color: '#8B1A2B' }}>{p.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{p.citation} · {p.journalName} · {p.publishedYear}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results!.articles.length > 0 && (
                <div className={results!.papers.length > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Articles</p>
                  {results!.articles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/articles/${a.slug}` as never}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors"
                    >
                      <FileText size={13} className="mt-0.5 flex-shrink-0 text-brand-crimson" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#8B1A2B' }}>{a.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{a.hook}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] text-gray-400">Press Enter to see all results</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
