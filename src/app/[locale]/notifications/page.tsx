import { AppShell } from '@/components/layout/AppShell';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

export default function NotificationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NotificationsPanel />
      </div>
    </AppShell>
  );
}
