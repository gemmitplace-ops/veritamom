import { AppShell } from '@/components/layout/AppShell';
import { ArticlesPanel } from '@/components/publisher/ArticlesPanel';

export default function PublisherArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ArticlesPanel />
      </div>
    </AppShell>
  );
}
