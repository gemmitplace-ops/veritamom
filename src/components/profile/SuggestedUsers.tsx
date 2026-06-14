'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { BadgeCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  verifiedProfessionalTitle: string | null;
  _count: { followers: number };
}

export function SuggestedUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/users/suggested')
      .then(r => r.json())
      .then(d => setUsers(d.users || []));
  }, [currentUser]);

  async function follow(id: string) {
    const res = await fetch(`/api/users/${id}/follow`, { method: 'POST' });
    const data = await res.json();
    if (data.following) {
      setFollowedIds(prev => new Set([...prev, id]));
    }
  }

  if (!currentUser || users.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <UserPlus size={14} className="text-brand-crimson" />
        <h3 className="font-serif text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
          Suggested for you
        </h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {users.map(u => {
          const followed = followedIds.has(u.id);
          return (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/profile/${u.username}` as never} className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-crimson text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
                    {u.role === 'VERIFIED_PROFESSIONAL' && <BadgeCheck size={12} className="text-brand-gold-dark flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {u._count.followers} {u._count.followers === 1 ? 'follower' : 'followers'}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => follow(u.id)}
                disabled={followed}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  followed
                    ? 'text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-default'
                    : 'text-brand-crimson hover:bg-brand-crimson/5'
                }`}
              >
                {followed ? '✓' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
