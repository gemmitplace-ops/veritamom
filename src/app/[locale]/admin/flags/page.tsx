import { AppShell } from '@/components/layout/AppShell';
import { AdminFlagsPanel } from '@/components/admin/AdminFlagsPanel';

export default function AdminFlagsPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AdminFlagsPanel />
      </div>
    </AppShell>
  );
}
