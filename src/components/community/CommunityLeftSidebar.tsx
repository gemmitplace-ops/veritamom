'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle, TrendingUp, HelpCircle, Star, AlertTriangle, UtensilsCrossed, Package } from 'lucide-react';

const topicIcons: Record<string, React.ReactNode> = {
  Questions:       <HelpCircle size={13} />,
  Wins:            <Star size={13} />,
  Concerns:        <AlertTriangle size={13} />,
  Recipes:         <UtensilsCrossed size={13} />,
  'Product Reviews': <Package size={13} />,
};

const topics = ['Questions', 'Wins', 'Concerns', 'Recipes', 'Product Reviews'];

export function CommunityLeftSidebar() {
  const [stats, setStats] = useState<{ total: number; online: number } | null>(null);

  useEffect(() => {
    fetch('/api/posts?limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.total !== undefined) setStats({ total: d.total, online: Math.floor(d.total * 0.08) + 3 });
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-5">
      {/* Community identity */}
      <div
        className="rounded-xl border border-brand-gold/25 overflow-hidden"
        style={{ backgroundColor: '#FAF8F3' }}
      >
        {/* Crimson header band */}
        <div className="px-4 py-3" style={{ backgroundColor: '#8B1A2B' }}>
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-brand-gold" style={{ color: '#C9A84C' }} />
            <h3 className="font-serif text-sm font-bold text-white">The Circle</h3>
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Veritamom Community
          </p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            A safe space for mothers and caregivers to share evidence-grounded experiences.
          </p>
          {stats && (
            <div className="flex gap-3 pt-1">
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: '#8B1A2B' }}>{stats.total.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Posts</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: '#C9A84C' }}>{stats.online}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Online</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <TrendingUp size={12} style={{ color: '#8B1A2B' }} />
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Browse Topics
          </h3>
        </div>
        <nav className="p-2 space-y-0.5">
          {topics.map((topic) => (
            <Link
              key={topic}
              href={'/community' as never}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-crimson/6 hover:text-brand-crimson transition-colors group"
            >
              <span className="text-gray-400 group-hover:text-brand-crimson transition-colors">
                {topicIcons[topic]}
              </span>
              <span>{topic}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Community guidelines teaser */}
      <div
        className="rounded-xl border border-brand-gold/25 px-4 py-3"
        style={{ backgroundColor: 'rgba(201,168,76,0.06)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: '#A88C3A' }}>
          Community Guidelines
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed list-none">
          {['Be kind and supportive', 'Cite sources when possible', 'No medical advice', 'Respect privacy'].map((g) => (
            <li key={g} className="flex items-start gap-1.5">
              <span style={{ color: '#C9A84C' }}>·</span>
              {g}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
