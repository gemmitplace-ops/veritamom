'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TrendingUp, MessageCircle, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  upvotes: number;
  _count: { comments: number };
  author: { name: string };
}

export function RightSidebar() {
  const t = useTranslations('sidebar');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts?limit=6&sort=top')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));
  }, []);

  const trending = posts.slice(0, 5);
  const threads = posts.slice(0, 3);

  return (
    <aside className="space-y-6">
      {/* Trending section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-crimson" />
          <h3 className="font-serif text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            {t('trendingRecalls')}
          </h3>
        </div>
        <div className="p-3 space-y-1">
          {trending.length === 0
            ? [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 py-2 animate-pulse">
                  <div className="w-5 h-4 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 mt-0.5" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded flex-1" />
                </div>
              ))
            : trending.map((post, idx) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}` as never}
                  className="flex gap-3 py-1.5 group"
                >
                  <span className="text-sm font-bold text-brand-gold flex-shrink-0 w-5 leading-5">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-brand-crimson transition-colors leading-relaxed line-clamp-2">
                    {post.title}
                  </span>
                </Link>
              ))}
        </div>
      </div>

      {/* Community threads */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <MessageCircle size={14} className="text-brand-crimson" />
          <h3 className="font-serif text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            {t('communityThreads')}
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {threads.length === 0
            ? [1, 2, 3].map((i) => (
                <div key={i} className="p-4 animate-pulse space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
                </div>
              ))
            : threads.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}` as never}
                  className="block px-4 py-3 hover:bg-brand-cream dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <p className="text-xs font-semibold text-brand-crimson mb-0.5 uppercase tracking-wide">
                    {t('communityThread')}
                  </p>
                  <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-snug group-hover:text-brand-crimson transition-colors line-clamp-1 mb-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {post.body}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>
                </Link>
              ))}
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/community"
            className="flex items-center gap-1 text-xs text-brand-crimson hover:text-brand-crimson-dark font-medium transition-colors"
          >
            {t('showMore')} <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Brief feature card */}
      <div className="bg-gradient-to-br from-brand-crimson to-brand-crimson-dark rounded-xl p-4 text-white">
        <p className="text-[10px] uppercase tracking-widest text-brand-gold-light mb-1 font-medium">
          {t('weeklyFeature')}
        </p>
        <h3 className="font-serif text-base leading-snug mb-2">
          {t('veritamomBrief')}
        </h3>
        <p className="text-xs opacity-80 leading-relaxed mb-3">
          {t('briefDescription')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-gold-light hover:text-white transition-colors"
        >
          {t('readThisWeek')} <ChevronRight size={12} />
        </Link>
      </div>
    </aside>
  );
}
