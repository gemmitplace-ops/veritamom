import { AppShell } from '@/components/layout/AppShell';
import { ResearchFeed } from '@/components/research/ResearchFeed';
import { TaxonomySidebar } from '@/components/layout/TaxonomySidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'research' });
  return {
    title: `Veritamom — ${t('title')}`,
    description: t('subtitle'),
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      {/* Three-column layout: 15 / 60 / 25 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* Left: Taxonomy sidebar (15%) */}
          <aside className="hidden xl:block w-48 flex-shrink-0 pt-1">
            <div className="sticky top-24">
              <TaxonomySidebar />
            </div>
          </aside>

          {/* Center: Research feed (flex-1 ≈ 60%) */}
          <main className="flex-1 min-w-0">
            <ResearchFeed locale={locale} />
          </main>

          {/* Right: Trending + threads (25%) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <RightSidebar />
            </div>
          </aside>

        </div>
      </div>
    </AppShell>
  );
}
