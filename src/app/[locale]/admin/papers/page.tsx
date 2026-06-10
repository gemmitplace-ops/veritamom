import { AppShell } from '@/components/layout/AppShell';
import { AdminPapersPanel } from '@/components/admin/AdminPapersPanel';

export default function AdminPapersPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AdminPapersPanel />
      </div>
    </AppShell>
  );
}
