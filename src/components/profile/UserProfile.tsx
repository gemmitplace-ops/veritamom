'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCountryFlag } from '@/lib/utils';
import { BadgeCheck, MapPin } from 'lucide-react';

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

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => setProfile(d.user))
      .finally(() => setLoading(false));
  }, [username]);

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
    </div>
  );
}
