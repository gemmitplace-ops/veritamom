import { AppShell } from '@/components/layout/AppShell';
import { MessagesPanel } from '@/components/messages/MessagesPanel';

export default function MessagesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 h-[calc(100vh-4rem)]">
        <MessagesPanel />
      </div>
    </AppShell>
  );
}
