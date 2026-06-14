'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { X, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  verifiedProfessionalTitle: string | null;
}

interface Props {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export function FollowListModal({ userId, type, onClose }: Props) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/users/${userId}/${type}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); });
  }, [userId, type]);

  async function toggleFollow(targetId: string) {
    const res = await fetch(`/api/users/${targetId}/follow`, { method: 'POST' });
    const data = await res.json();
    setFollowingSet(prev => {
      const next = new Set(prev);
      data.following ? next.add(targetId) : next.delete(targetId);
      return next;
    });
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-lg text-gray-900 dark:text-gray-100 capitalize">{type}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No {type} yet</div>
          ) : (
            users.map(u => {
              const isMe = currentUser?.id === u.id;
              const isFollowing = followingSet.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <Link href={`/profile/${u.username}` as never} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-crimson text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
                        {u.role === 'VERIFIED_PROFESSIONAL' && <BadgeCheck size={14} className="text-brand-gold-dark flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-400">@{u.username}</span>
                    </div>
                  </Link>
                  {!isMe && currentUser && (
                    <button
                      onClick={() => toggleFollow(u.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isFollowing
                          ? 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'bg-brand-crimson text-white hover:opacity-90'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
