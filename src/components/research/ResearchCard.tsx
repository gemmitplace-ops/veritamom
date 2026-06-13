'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Heart, Bookmark, MessageCircle, ExternalLink, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';

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
  userLiked: boolean;
  userSaved: boolean;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  _count: { likes: number; saves: number };
}

export function ResearchCard({ paper, locale }: { paper: Paper; locale: string }) {
  const t = useTranslations();
  const { user } = useAuth();
  const [liked, setLiked] = useState(paper.userLiked);
  const [saved, setSaved] = useState(paper.userSaved);
  const [likeCount, setLikeCount] = useState(paper.likeCount);

  const summary =
    locale === 'zh' ? paper.summaryZh || paper.summary
    : locale === 'ko' ? paper.summaryKo || paper.summary
    : paper.summary;

  async function handleLike() {
    if (!user) return;
    const res = await fetch(`/api/papers/${paper.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => data.liked ? c + 1 : c - 1);
  }

  async function handleSave() {
    if (!user) return;
    const res = await fetch(`/api/papers/${paper.id}/save`, { method: 'POST' });
    const data = await res.json();
    setSaved(data.saved);
  }

  // Count how many studies the paper cites (use tags as a proxy label)
  const studyLabel = paper.tags.length > 0
    ? `${paper.tags.length} Studies Cited`
    : 'Peer Reviewed';

  return (
    <article className="group bg-brand-cream dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(139,26,43,0.10)] hover:border-brand-gold/40 transition-all duration-200">
      <div className="flex">
        {/* Gold left accent bar — solid 4px #C9A84C */}
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: '#C9A84C' }} />

        <div className="px-4 py-3.5 flex-1 min-w-0">
          {/* Studies badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-gold-dark bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-1 rounded-full">
              <BookOpen size={10} />
              {studyLabel}
            </span>
            {paper.trimesterRelevance && paper.trimesterRelevance !== 'ALL' && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                {paper.trimesterRelevance.split(',')[0]}
              </span>
            )}
          </div>

          {/* Title — links to detail page */}
          <Link href={`/papers/${paper.id}` as never}>
            <h2 className="font-serif text-base leading-snug mb-1 hover:underline cursor-pointer transition-colors" style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {paper.title}
            </h2>
          </Link>

          {/* Citation */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {paper.citation}
            <span className="text-gray-300 dark:text-gray-600 mx-1.5">·</span>
            <span className="italic">{paper.journalName}</span>
            <span className="text-gray-300 dark:text-gray-600 mx-1.5">·</span>
            {paper.publishedYear}
          </p>

          {/* AI Summary */}
          {summary && (
            <div className="mb-3 pl-3 border-l-2" style={{ borderColor: '#C9A84C' }}>
              <p className="mb-1 uppercase tracking-[0.14em] font-semibold" style={{ fontSize: '9.5px', color: '#A88C3A' }}>
                {t('research.aiSummary')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Tags */}
          {paper.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {paper.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg min-h-[40px] transition-colors font-medium',
                !user ? 'opacity-40 cursor-not-allowed text-gray-400' :
                liked ? 'text-brand-crimson bg-brand-crimson/5 hover:bg-brand-crimson/10'
                      : 'text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5'
              )}
              title={!user ? t('research.loginToInteract') : undefined}
            >
              <Heart size={14} className={liked ? 'fill-brand-crimson' : ''} />
              <span>{likeCount > 0 ? likeCount : t('research.like')}</span>
            </button>

            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg min-h-[40px] transition-colors font-medium',
                !user ? 'opacity-40 cursor-not-allowed text-gray-400' :
                saved ? 'text-brand-gold-dark bg-brand-gold/8 hover:bg-brand-gold/15'
                      : 'text-gray-500 hover:text-brand-gold-dark hover:bg-brand-gold/8'
              )}
              title={!user ? t('research.loginToInteract') : undefined}
            >
              <Bookmark size={14} className={saved ? 'fill-brand-gold-dark' : ''} />
              <span>{saved ? t('research.saved') : t('research.save')}</span>
            </button>

            <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg min-h-[40px] text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5 transition-colors font-medium">
              <MessageCircle size={14} />
              <span>{t('research.comments')}</span>
            </button>

            {paper.fullPaperUrl && (
              <a
                href={paper.fullPaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg min-h-[40px] text-brand-gold-dark hover:text-brand-gold hover:bg-brand-gold/8 transition-colors font-medium"
              >
                <span className="hidden sm:inline">{t('research.readMore')}</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
