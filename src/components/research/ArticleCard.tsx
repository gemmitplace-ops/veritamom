'use client';

import { Link } from '@/i18n/navigation';
import { CheckCircle, TrendingUp, AlertCircle, ChevronRight, BookOpen } from 'lucide-react';

interface ArticleCitation {
  paper: { id: string; title: string; journalName: string; publishedYear: number; citation: string };
  note?: string | null;
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
  citations: ArticleCitation[];
}

const confidenceConfig = {
  ESTABLISHED: { label: 'Established', icon: CheckCircle, color: '#2d7a4f', bg: '#edf7f0', border: '#a3d9b8' },
  EMERGING: { label: 'Emerging Research', icon: TrendingUp, color: '#b45309', bg: '#fef3e2', border: '#fbbf24' },
  DEBATED: { label: 'Debated', icon: AlertCircle, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
};

export function ArticleCard({ article, locale }: { article: Article; locale: string }) {
  const conf = confidenceConfig[article.confidenceLevel];
  const ConfIcon = conf.icon;

  return (
    <Link href={`/articles/${article.slug}` as never} locale={locale as never}>
      <article className="group bg-white dark:bg-gray-900 rounded-xl border-2 border-brand-crimson/15 overflow-hidden shadow-[0_2px_16px_rgba(139,26,43,0.08)] hover:shadow-[0_6px_28px_rgba(139,26,43,0.14)] hover:border-brand-crimson/35 transition-all duration-200 cursor-pointer">
        <div className="flex">
          {/* Crimson accent bar — articles are crimson, papers are gold */}
          <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: '#8B1A2B' }} />

          <div className="px-5 py-4 flex-1 min-w-0">
            {/* Top row: type badge + confidence + trimester */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-crimson bg-brand-crimson/8 border border-brand-crimson/20 px-2.5 py-1 rounded-full">
                <BookOpen size={10} />
                Veritamom Article
              </span>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border"
                style={{ color: conf.color, backgroundColor: conf.bg, borderColor: conf.border }}
              >
                <ConfIcon size={10} />
                {conf.label}
              </span>
              {article.trimesterRelevance && article.trimesterRelevance !== 'ALL' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {article.trimesterRelevance.split(',')[0]}
                </span>
              )}
            </div>

            {/* The hook — the question moms are asking */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: '#A88C3A' }}>
              {article.hook}
            </p>

            {/* Title */}
            <h2 className="font-serif text-lg leading-snug mb-2 group-hover:text-brand-crimson transition-colors" style={{ color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {article.title}
            </h2>

            {/* TLDR — the plain-English answer */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
              {article.tldr}
            </p>

            {/* Citations preview */}
            {article.citations.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="font-semibold text-brand-gold-dark">{article.citations.length}</span>
                  <span>{article.citations.length === 1 ? 'source' : 'sources'} cited</span>
                  <span className="mx-1">·</span>
                  <span className="italic truncate max-w-[200px]">
                    {article.citations[0].paper.journalName}
                    {article.citations.length > 1 && ` +${article.citations.length - 1} more`}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400">
                By {article.author.name}
                {article.publishedAt && (
                  <span> · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                )}
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-brand-crimson group-hover:gap-1.5 transition-all">
                Read <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
