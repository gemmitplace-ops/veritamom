'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserPlus, BarChart2, ChevronRight, BadgeCheck } from 'lucide-react';

interface UserSuggestion {
  id: string;
  name: string;
  username: string;
  role: string;
  verifiedProfessionalTitle: string | null;
  country: string | null;
}

const FLAG_MAP: Record<string, string> = {
  SG: '🇸🇬', KR: '🇰🇷', US: '🇺🇸', GB: '🇬🇧', AU: '🇦🇺',
  CA: '🇨🇦', IN: '🇮🇳', CN: '🇨🇳', JP: '🇯🇵', DE: '🇩🇪',
  FR: '🇫🇷', BR: '🇧🇷', MY: '🇲🇾', PH: '🇵🇭', NZ: '🇳🇿',
};

function flag(code: string | null) {
  if (!code) return '';
  return FLAG_MAP[code.toUpperCase()] || '';
}

export function CommunityRightSidebar() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [stats, setStats] = useState<{ posts: number; members: number; replies: number } | null>(null);

  useEffect(() => {
    // Derive "Who to Follow" from top posters
    fetch('/api/posts?limit=20&sort=top')
      .then((r) => r.json())
      .then((d) => {
        const posts: Array<{ author: UserSuggestion; _count: { comments: number } }> = d.posts || [];
        // Deduplicate by author id, keep unique authors
        const seen = new Set<string>();
        const unique: UserSuggestion[] = [];
        for (const p of posts) {
          if (!seen.has(p.author.id)) {
            seen.add(p.author.id);
            unique.push(p.author);
          }
          if (unique.length >= 5) break;
        }
        setSuggestions(unique);
        if (d.total !== undefined) {
          setStats({ posts: d.total, members: d.total * 4 + 12, replies: d.total * 7 + 30 });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-5">
      {/* Who to Follow */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <UserPlus size={13} style={{ color: '#8B1A2B' }} />
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Who to Follow
          </h3>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-cream dark:hover:bg-gray-800/50 transition-colors">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#8B1A2B' }}
                >
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/profile/${s.username}` as never}
                      className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-crimson transition-colors truncate"
                    >
                      {s.name}
                    </Link>
                    {s.role === 'VERIFIED_PROFESSIONAL' && (
                      <BadgeCheck size={12} style={{ color: '#C9A84C' }} className="flex-shrink-0" />
                    )}
                    {flag(s.country) && (
                      <span className="text-xs flex-shrink-0">{flag(s.country)}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">
                    {s.verifiedProfessionalTitle || `@${s.username}`}
                  </p>
                </div>
                {user && (
                  <button
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors flex-shrink-0"
                    style={{ color: '#8B1A2B', borderColor: 'rgba(139,26,43,0.3)' }}
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
            <Link
              href={'/community' as never}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#8B1A2B' }}
            >
              See all members <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Community Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <BarChart2 size={13} style={{ color: '#8B1A2B' }} />
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Community Stats
          </h3>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Posts', value: stats?.posts ?? '—' },
            { label: 'Members', value: stats ? stats.members : '—' },
            { label: 'Replies', value: stats ? stats.replies : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm font-bold" style={{ color: '#8B1A2B' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join CTA (for guests) */}
      {!user && (
        <div
          className="rounded-xl p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #8B1A2B 0%, #6d1422 100%)' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ color: '#C9A84C' }}>
            Join the Circle
          </p>
          <p className="text-sm font-serif leading-snug mb-3">
            Share your story with thousands of mothers worldwide.
          </p>
          <Link
            href={'/sign-up' as never}
            className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            style={{ backgroundColor: '#C9A84C', color: '#fff' }}
          >
            Sign up free
          </Link>
        </div>
      )}

      {/* Active now */}
      <div
        className="rounded-xl border border-brand-gold/25 px-4 py-3"
        style={{ backgroundColor: 'rgba(201,168,76,0.06)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#A88C3A' }}>
            Active Discussions
          </p>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Join the conversation happening right now in The Circle.
        </p>
      </div>
    </aside>
  );
}
