'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Link } from '@/i18n/navigation';
import { FileText, Flag, BadgeCheck, Users, Shield, PenLine } from 'lucide-react';


const adminSections = [
  {
    href: '/admin/users',
    icon: Users,
    title: 'User Management',
    description: 'View all users, promote to Publisher or demote roles.',
    color: '#8B1A2B',
  },
  {
    href: '/publisher/papers',
    icon: FileText,
    title: 'Research Papers',
    description: 'Add, edit and publish research papers shown on the homepage.',
    color: '#8B1A2B',
  },
  {
    href: '/publisher/articles',
    icon: PenLine,
    title: 'Articles',
    description: 'Write and publish mom-friendly articles backed by academic research.',
    color: '#8B1A2B',
  },
  {
    href: '/admin/flags',
    icon: Flag,
    title: 'Flagged Content',
    description: 'Review and moderate community posts and comments flagged by users.',
    color: '#C9A84C',
  },
  {
    href: '/admin/professionals',
    icon: BadgeCheck,
    title: 'Verify Professionals',
    description: 'Approve or reject professional verification requests.',
    color: '#8B1A2B',
  },
];

export default function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <AppShell locale={locale}>
        <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-crimson/30 border-t-brand-crimson animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell locale={locale}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139,26,43,0.1)' }}
          >
            <Shield size={20} style={{ color: '#8B1A2B' }} />
          </div>
          <div>
            <h1
              className="font-serif text-2xl font-bold"
              style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">Signed in as {user.name}</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map(({ href, icon: Icon, title, description, color }) => (
            <Link
              key={href}
              href={href as never}
              className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand-gold/40 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h2 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-crimson transition-colors">
                {title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
