'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Link } from '@/i18n/navigation';
import { User, LogIn } from 'lucide-react';

export default function ProfileIndexPage({ params: { locale } }: { params: { locale: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to the logged-in user's profile page
      router.replace(`/profile/${user.username}` as never);
    }
  }, [user, loading, router]);

  // While auth is resolving, show nothing (avoids flash)
  if (loading) {
    return (
      <AppShell locale={locale}>
        <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-crimson/30 border-t-brand-crimson animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Logged-in users are redirected above; this renders briefly or for guests
  if (user) return null;

  // Guest: show a sign-in prompt
  return (
    <AppShell locale={locale}>
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}
        >
          <User size={28} style={{ color: '#8B1A2B' }} />
        </div>

        <h1
          className="font-serif text-3xl mb-2"
          style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Your Profile
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Sign in to view and manage your Veritamom profile, saved research, and community activity.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-sm shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#8B1A2B' }}
        >
          <LogIn size={16} />
          Sign in
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          No account?{' '}
          <Link href="/sign-up" className="font-medium" style={{ color: '#8B1A2B' }}>
            Create one free
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
