'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChevronUp, ChevronDown, MessageCircle, Flag, Pin, BadgeCheck } from 'lucide-react';
import { cn, getCountryFlag, formatRelativeTime } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    body: string;
    category: string;
    upvotes: number;
    downvotes: number;
    isPinned: boolean;
    createdAt: string;
    userVote: number;
    author: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
      role: string;
      verifiedProfessionalTitle: string | null;
      country: string | null;
    };
    _count: { comments: number };
  };
  onUpdate?: () => void;
}

// Category badge styles — gold for WIN/RECIPE, crimson for QUESTION/CONCERN
const categoryStyle: Record<string, { bg: string; color: string; border: string; label: string }> = {
  QUESTION:       { bg: 'rgba(139,26,43,0.07)',  color: '#8B1A2B',  border: 'rgba(139,26,43,0.2)',  label: 'Question' },
  WIN:            { bg: 'rgba(201,168,76,0.12)', color: '#A88C3A',  border: 'rgba(201,168,76,0.35)', label: 'Win 🎉' },
  CONCERN:        { bg: 'rgba(139,26,43,0.07)',  color: '#8B1A2B',  border: 'rgba(139,26,43,0.2)',  label: 'Concern' },
  PRODUCT_REVIEW: { bg: 'rgba(201,168,76,0.12)', color: '#A88C3A',  border: 'rgba(201,168,76,0.35)', label: 'Review' },
  RECIPE:         { bg: 'rgba(201,168,76,0.12)', color: '#A88C3A',  border: 'rgba(201,168,76,0.35)', label: 'Recipe' },
};

// Country code → flag emoji
const FLAG_MAP: Record<string, string> = {
  SG: '🇸🇬', KR: '🇰🇷', US: '🇺🇸', GB: '🇬🇧', AU: '🇦🇺',
  CA: '🇨🇦', IN: '🇮🇳', CN: '🇨🇳', JP: '🇯🇵', DE: '🇩🇪',
  FR: '🇫🇷', BR: '🇧🇷', MX: '🇲🇽', NZ: '🇳🇿', ZA: '🇿🇦',
  PH: '🇵🇭', MY: '🇲🇾', ID: '🇮🇩', TH: '🇹🇭', VN: '🇻🇳',
  NG: '🇳🇬', KE: '🇰🇪', GH: '🇬🇭',
};

function countryWithFlag(code: string | null): string {
  if (!code) return '';
  const upper = code.toUpperCase();
  const flag = FLAG_MAP[upper] || getCountryFlag(upper) || '';
  return flag ? `${upper} ${flag}` : upper;
}

// Gold left-bar color per category
function accentColor(category: string): string {
  return ['WIN', 'RECIPE', 'PRODUCT_REVIEW'].includes(category) ? '#C9A84C' : '#8B1A2B';
}

export function PostCard({ post, onUpdate: _onUpdate }: PostCardProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const [votes, setVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes, userVote: post.userVote });
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const catStyle = categoryStyle[post.category] ?? { bg: '#f5f5f5', color: '#555', border: '#ddd', label: post.category };
  const accent = accentColor(post.category);
  const score = votes.upvotes - votes.downvotes;

  async function vote(value: 1 | -1) {
    if (!user) return;
    const newValue = votes.userVote === value ? 0 : value;
    const res = await fetch(`/api/posts/${post.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    });
    if (res.ok) {
      setVotes((v) => {
        const up = v.upvotes + (newValue === 1 ? 1 : v.userVote === 1 ? -1 : 0);
        const down = v.downvotes + (newValue === -1 ? 1 : v.userVote === -1 ? -1 : 0);
        return { upvotes: up, downvotes: down, userVote: newValue };
      });
    }
  }

  async function submitFlag() {
    if (!flagReason.trim()) return;
    await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'POST', targetId: post.id, reason: flagReason }),
    });
    setFlagging(false);
    setFlagReason('');
  }

  return (
    <article
      className="group rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(139,26,43,0.10)] hover:border-brand-gold/40 transition-all duration-200"
      style={{ backgroundColor: '#FAF8F3' }}
    >
      <div className="flex">
        {/* Colored left accent bar */}
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: accent }} />

        <div className="px-4 py-3.5 flex-1 min-w-0">
          {/* Pinned banner */}
          {post.isPinned && (
            <div className="flex items-center gap-1 text-xs mb-2 font-medium" style={{ color: '#A88C3A' }}>
              <Pin size={11} />
              <span>{t('community.pinned')}</span>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-start gap-3 mb-2.5">
            {/* Avatar: proper crimson circle with white initials */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ring-2 ring-white dark:ring-gray-900"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              {post.author.name[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-crimson transition-colors"
                >
                  {post.author.name}
                </Link>
                {post.author.country && (
                  <span className="text-xs text-gray-400 font-medium">
                    {countryWithFlag(post.author.country)}
                  </span>
                )}
                {post.author.role === 'VERIFIED_PROFESSIONAL' && (
                  <span title={post.author.verifiedProfessionalTitle || t('community.verified')} style={{ color: '#C9A84C' }}>
                    <BadgeCheck size={14} className="inline" />
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(post.createdAt)}</p>
            </div>

            {/* Category badge */}
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 border"
              style={{ backgroundColor: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}
            >
              {catStyle.label}
            </span>
          </div>

          {/* Post content */}
          <Link href={`/community/${post.id}`} className="block group/link">
            <h2
              className="font-serif text-base leading-snug mb-1.5 group-hover/link:text-brand-crimson transition-colors"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a' }}
            >
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {post.body}
            </p>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
            {/* Vote */}
            <div className="flex items-center gap-0.5 mr-1">
              <button
                onClick={() => vote(1)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  votes.userVote === 1
                    ? 'text-brand-crimson bg-brand-crimson/8'
                    : 'text-gray-400 hover:text-brand-crimson hover:bg-brand-crimson/6'
                )}
              >
                <ChevronUp size={16} />
              </button>
              <span
                className="text-sm font-bold min-w-[24px] text-center"
                style={{ color: score > 0 ? '#8B1A2B' : score < 0 ? '#6b7280' : '#6b7280' }}
              >
                {score}
              </span>
              <button
                onClick={() => vote(-1)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  votes.userVote === -1
                    ? 'text-gray-600 bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Comment count */}
            <Link
              href={`/community/${post.id}`}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5 transition-colors"
            >
              <MessageCircle size={14} />
              <span>{post._count.comments} {post._count.comments === 1 ? 'reply' : 'replies'}</span>
            </Link>

            {/* Flag */}
            {user && (
              <button
                onClick={() => setFlagging(true)}
                className="ml-auto p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <Flag size={13} />
              </button>
            )}
          </div>

          {/* Flag form */}
          {flagging && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder={t('community.flagReason')}
                className="w-full text-sm p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-brand-crimson/25"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setFlagging(false); setFlagReason(''); }}
                  className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={submitFlag}
                  className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('community.flagSubmit')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
