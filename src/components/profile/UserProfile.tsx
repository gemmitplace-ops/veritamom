'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCountryFlag } from '@/lib/utils';
import { BadgeCheck, MapPin, Shield, Baby, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ChildItem {
  id: string;
  name: string;
  dob: string;
  sex: 'GIRL' | 'BOY';
}

function childAge(dob: string) {
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 24) return `${Math.max(months, 0)}m`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}m` : `${y}y`;
}

interface ProfileUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  role: string;
  verifiedProfessionalTitle: string | null;
  pregnancyStatus: string;
  _count: { followers: number; following: number; posts: number };
}

export function UserProfile({ username }: { username: string }) {
  const t = useTranslations();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [children, setChildren] = useState<ChildItem[]>([]);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => setProfile(d.user))
      .finally(() => setLoading(false));
  }, [username]);

  // Children are private — only fetched and shown on the user's own profile
  useEffect(() => {
    if (!profile || !currentUser || currentUser.id !== profile.id) return;
    fetch('/api/children')
      .then((r) => (r.ok ? r.json() : { children: [] }))
      .then((d) => setChildren(d.children ?? []))
      .catch(() => {});
  }, [profile, currentUser]);

  async function handleFollow() {
    if (!currentUser || !profile) return;
    const res = await fetch(`/api/users/${profile.id}/follow`, { method: 'POST' });
    const data = await res.json();
    setFollowing(data.following);
  }

  const statusLabels: Record<string, string> = {
    PREGNANT: t('profile.pregnancyStatus.PREGNANT'),
    PARENT: t('profile.pregnancyStatus.PARENT'),
    TRYING: t('profile.pregnancyStatus.TRYING'),
    PROFESSIONAL: t('profile.pregnancyStatus.PROFESSIONAL'),
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-16 text-gray-500">User not found.</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-crimson text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl text-gray-900 dark:text-gray-100">{profile.name}</h1>
              {profile.role === 'VERIFIED_PROFESSIONAL' && (
                <span title={profile.verifiedProfessionalTitle || t('community.verified')}>
                  <BadgeCheck size={20} className="text-brand-gold-dark" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>

            {(profile.country || profile.city) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={12} />
                {profile.country && <span>{getCountryFlag(profile.country)}</span>}
                {profile.city || profile.country}
              </p>
            )}

            <p className="text-sm text-brand-gold-dark mt-1">
              {statusLabels[profile.pregnancyStatus] || profile.pregnancyStatus}
            </p>

            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>
            )}
          </div>

          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                following
                  ? 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  : 'bg-brand-crimson text-white hover:bg-brand-crimson-dark'
              }`}
            >
              {following ? t('profile.unfollow') : t('profile.follow')}
            </button>
          )}
        </div>

        {/* Admin link */}
        {isOwnProfile && currentUser?.role === 'ADMIN' && (
          <div className="mt-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              <Shield size={14} />
              Admin Dashboard
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: t('profile.posts'), value: profile._count.posts },
            { label: t('profile.followers'), value: profile._count.followers },
            { label: t('profile.following'), value: profile._count.following },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Children — own profile only */}
      {isOwnProfile && children.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 font-serif text-lg text-gray-900 dark:text-gray-100">
              <Baby size={18} style={{ color: '#C9A84C' }} />
              {t('profile.myChildren')}
            </h2>
            <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
              {t('profile.visibleOnlyToYou')}
            </span>
          </div>

          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: child.sex === 'GIRL' ? 'rgba(201,168,76,0.15)' : 'rgba(139,26,43,0.10)' }}
                >
                  {child.sex === 'GIRL' ? '👧' : '👦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{child.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {child.sex === 'GIRL' ? t('profile.childGirl') : t('profile.childBoy')} · {childAge(child.dob)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {t('profile.childBorn')}{' '}
                  {new Date(child.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={{ pathname: '/tools', query: { tool: 'growth' } } as never}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-medium text-brand-crimson hover:bg-brand-crimson/5 transition-colors"
          >
            <TrendingUp size={13} />
            {t('profile.openGrowthChart')}
          </Link>
        </div>
      )}
    </div>
  );
}
