'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/navigation';
import { formatRelativeTime } from '@/lib/utils';

interface Flag {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { name: string; username: string };
}

export function AdminFlagsPanel() {
  const t = useTranslations();
  const { user } = useAuth();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch('/api/admin/flags')
      .then((r) => r.json())
      .then((d) => setFlags(d.flags || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function resolve(id: string) {
    await fetch(`/api/admin/flags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    load();
  }

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-16 text-gray-500">Access denied.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-crimson">{t('admin.flags')}</h1>
      </div>

      <div className="flex gap-3 mb-6 text-sm">
        <Link href="/admin/papers" className="text-gray-500 hover:text-brand-crimson pb-1">Papers</Link>
        <Link href="/admin/flags" className="text-brand-crimson font-medium border-b-2 border-brand-crimson pb-1">Flags</Link>
        <Link href="/admin/professionals" className="text-gray-500 hover:text-brand-crimson pb-1">Professionals</Link>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
        </div>
      ) : flags.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">{t('admin.noFlags')}</div>
      ) : (
        <div className="space-y-2">
          {flags.map((flag) => (
            <div key={flag.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${flag.status === 'PENDING' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                      {flag.status}
                    </span>
                    <span className="text-xs text-gray-500">{flag.targetType} · {flag.targetId}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{flag.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('admin.reportedBy')} @{flag.reporter.username} · {formatRelativeTime(flag.createdAt)}
                  </p>
                </div>
                {flag.status === 'PENDING' && (
                  <button
                    onClick={() => resolve(flag.id)}
                    className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 min-h-[36px]"
                  >
                    {t('admin.resolve')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
