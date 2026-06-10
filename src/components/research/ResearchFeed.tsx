'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ResearchCard } from './ResearchCard';
import { ResearchSkeleton } from './ResearchSkeleton';
import { cn } from '@/lib/utils';

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

export function ResearchFeed({ locale }: { locale: string }) {
  const t = useTranslations();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [trimester, setTrimester] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/papers?trimester=${trimester}`)
      .then((r) => r.json())
      .then((data) => setPapers(data.papers || []))
      .finally(() => setLoading(false));
  }, [trimester]);

  return (
    <div>
      {/* Filter pill bar — matches mobile mockup tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {trimesters.map(({ value, key }) => (
          <button
            key={value}
            onClick={() => setTrimester(value)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              trimester === value
                ? 'bg-brand-crimson text-white border-brand-crimson shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-crimson/50 hover:text-brand-crimson'
            )}
          >
            {t(key as never)}
          </button>
        ))}
      </div>

      {/* Feed label */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg text-gray-800 dark:text-gray-200">
          {trimester === 'ALL' ? 'Latest Research' : `${trimester.charAt(0) + trimester.slice(1).toLowerCase()} Trimester`}
        </h2>
        <span className="text-xs text-gray-400">{papers.length} papers</span>
      </div>

      {/* The Veritamom Brief — featured editorial card */}
      <div className="mb-5 rounded-xl border border-brand-gold/25 overflow-hidden shadow-[0_2px_12px_rgba(201,168,76,0.12)]" style={{ backgroundColor: '#FAF8F3' }}>
        <div className="flex">
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: '#C9A84C' }} />
          <div className="p-5 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#A88C3A' }}>
                Editorial · Weekly Brief
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

      {/* Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <ResearchSkeleton key={i} />)}
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-1">{t('research.noResults')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('research.noResultsHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <ResearchCard key={paper.id} paper={paper} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
