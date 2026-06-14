import { AppShell } from '@/components/layout/AppShell';
import { ResearchFeed } from '@/components/research/ResearchFeed';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { MissionHero } from '@/components/layout/MissionHero';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'mission' });
  return {
    title: `Veritamom — ${t('headline')}`,
    description: t('subheadline'),
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* Center: Hero + Research feed */}
          <main className="flex-1 min-w-0">
            <MissionHero />
            <ResearchFeed locale={locale} />
          </main>

          {/* Right: Trending + threads */}
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
