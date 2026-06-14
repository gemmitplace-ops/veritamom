import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AskWidget } from '@/components/ai/AskWidget';

export function AppShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <AskWidget />
    </div>
  );
}
