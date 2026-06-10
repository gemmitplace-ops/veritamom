import { AppShell } from '@/components/layout/AppShell';
import { AdminProfessionalsPanel } from '@/components/admin/AdminProfessionalsPanel';
import { Link } from '@/i18n/navigation';

export default function AdminProfessionalsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Admin nav tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { href: '/admin/papers', label: 'Papers' },
            { href: '/admin/flags', label: 'Flags' },
            { href: '/admin/professionals', label: 'Professionals' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href as never}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-gray-500 hover:text-brand-crimson hover:border-brand-crimson/40"
            >
              {label}
            </Link>
          ))}
        </div>

        <AdminProfessionalsPanel />
      </div>
    </AppShell>
  );
}
