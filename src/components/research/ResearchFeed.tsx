'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ResearchCard } from './ResearchCard';
import { ArticleCard } from './ArticleCard';
import { ResearchSkeleton } from './ResearchSkeleton';

const trimesters = [
  { value: 'ALL', key: 'research.filterAll' },
  { value: 'FIRST', key: 'research.filterFirst' },
  { value: 'SECOND', key: 'research.filterSecond' },
  { value: 'THIRD', key: 'research.filterThird' },
  { value: 'POSTPARTUM', key: 'research.filterPostpartum' },
];

interface Paper {
  id: string;
  title: string;
  citation: string;
  journalName: string;
  publishedYear: number;
  summary: string | null;
  summaryZh: string | null;
  summaryKo: string | null;
  fullPaperUrl: string | null;
  trimesterRelevance: string;
  likeCount: number;
  viewCount: number;
  userLiked: boolean;
  userSaved: boolean;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  _count: { likes: number; saves: number };
}

interface Article {
  id: string;
  slug: string;
  title: string;
  hook: string;
  tldr: string;
  confidenceLevel: 'ESTABLISHED' | 'EMERGING' | 'DEBATED';
  trimesterRelevance: string;
  publishedAt: string | null;
  author: { name: string; username: string };
  citations: Array<{ paper: { id: string; title: string; journalName: string; publishedYear: number; citation: string }; note?: string | null }>;
}

type FeedItem = { type: 'article'; data: Article } | { type: 'paper'; data: Paper };

export function ResearchFeed({ locale }: { locale: string }) {
  const t = useTranslations();
  const t2 = useTranslations('research2');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [trimester, setTrimester] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const trimesterParam = trimester !== 'ALL' ? `&trimester=${trimester}` : '';
    Promise.allSettled([
      fetch(`/api/papers?trimester=${trimester}`).then((r) => r.json()),
      fetch(`/api/articles?limit=5${trimesterParam}`).then((r) => r.json()),
    ])
      .then(([paperResult, articleResult]) => {
        if (paperResult.status === 'fulfilled') setPapers(paperResult.value.papers || []);
        if (articleResult.status === 'fulfilled') setArticles(articleResult.value.articles || []);
      })
      .finally(() => setLoading(false));
  }, [trimester]);

  // Interleave: article every 3 papers
  const feedItems: FeedItem[] = [];
  let articleIdx = 0;
  for (let i = 0; i < papers.length; i++) {
    if (i > 0 && i % 3 === 0 && articleIdx < articles.length) {
      feedItems.push({ type: 'article', data: articles[articleIdx++] });
    }
    feedItems.push({ type: 'paper', data: papers[i] });
  }
  // Append remaining articles at end
  while (articleIdx < articles.length) {
    feedItems.push({ type: 'article', data: articles[articleIdx++] });
  }

  return (
    <div>
      {/* Filter dropdown */}
      <select
        value={trimester}
        onChange={(e) => setTrimester(e.target.value)}
        className="w-full mb-4 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60"
      >
        {trimesters.map(({ value, key }) => (
          <option key={value} value={value}>{t(key as never)}</option>
        ))}
      </select>

      {/* Feed label */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg text-gray-800 dark:text-gray-200">
          {trimester === 'ALL' ? t2('latestResearch') : t(`research.filter${trimester.charAt(0) + trimester.slice(1).toLowerCase()}` as never)}
        </h2>
        <span className="text-xs text-gray-400">{papers.length} papers · {articles.length} articles</span>
      </div>

      {/* The Veritamom Brief — featured editorial card */}
      <div className="mb-5 rounded-xl border border-brand-gold/25 overflow-hidden shadow-[0_2px_12px_rgba(201,168,76,0.12)]" style={{ backgroundColor: '#FAF8F3' }}>
        <div className="flex">
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: '#C9A84C' }} />
          <div className="p-5 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#A88C3A' }}>
                {t2('editorial')}
              </span>
            </div>
            <h2 className="font-serif text-[18px] leading-snug mb-2" style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              The Veritamom Brief
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Our medical team curates the most important maternal health developments each week — from new clinical guidelines to product safety alerts — distilled into clear, evidence-grounded insights for mothers and caregivers.
            </p>
            <button className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: '#8B1A2B' }}>
              Learn More <span aria-hidden>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mixed feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <ResearchSkeleton key={i} />)}
        </div>
      ) : feedItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-1">{t('research.noResults')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('research.noResultsHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) =>
            item.type === 'article'
              ? <ArticleCard key={`a-${item.data.id}`} article={item.data} locale={locale} />
              : <ResearchCard key={`p-${item.data.id}`} paper={item.data} locale={locale} />
          )}
        </div>
      )}
    </div>
  );
}
