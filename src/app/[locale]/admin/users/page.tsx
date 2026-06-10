'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Link } from '@/i18n/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  country: string | null;
  pregnancyStatus: string;
  createdAt: string;
  _count: { posts: number; followers: number };
}

const ROLE_LABELS: Record<string, string> = {
  MOTHER: 'Mother',
  PUBLISHER: 'Publisher',
  ADMIN: 'Admin',
  VERIFIED_PROFESSIONAL: 'Verified Pro',
};

const ROLE_COLORS: Record<string, string> = {
  MOTHER: 'bg-gray-100 text-gray-600',
  PUBLISHER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-red-100 text-red-700',
  VERIFIED_PROFESSIONAL: 'bg-yellow-100 text-yellow-700',
};

export default function AdminUsersPage({ params: { locale } }: { params: { locale: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const load = useCallback(() => {
    setLoadingUsers(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .finally(() => setLoadingUsers(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function setRole(userId: string, role: string) {
    setUpdating(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      load();
    } finally {
      setUpdating(null);
    }
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <AppShell locale={locale}>
        <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-crimson/30 border-t-brand-crimson animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell locale={locale}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Admin nav */}
        <div className="flex gap-4 mb-6 text-sm border-b border-gray-200 dark:border-gray-800 pb-3">
          <Link href="/admin" className="text-gray-500 hover:text-brand-crimson pb-1">Dashboard</Link>
          <Link href="/admin/users" className="text-brand-crimson font-medium border-b-2 border-brand-crimson pb-1">Users</Link>
          <Link href="/admin/flags" className="text-gray-500 hover:text-brand-crimson pb-1">Flags</Link>
          <Link href="/admin/professionals" className="text-gray-500 hover:text-brand-crimson pb-1">Professionals</Link>
          <Link href="/publisher/papers" className="text-gray-500 hover:text-brand-crimson pb-1">Papers</Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: '#8B1A2B' }}>User Management</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total users</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, username…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Posts</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{u.name}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u._count.posts}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'ADMIN' ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div className="flex gap-2">
                        {u.role !== 'PUBLISHER' ? (
                          <button
                            onClick={() => setRole(u.id, 'PUBLISHER')}
                            disabled={updating === u.id}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {updating === u.id ? '…' : 'Make Publisher'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setRole(u.id, 'MOTHER')}
                            disabled={updating === u.id}
                            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            {updating === u.id ? '…' : 'Demote'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
