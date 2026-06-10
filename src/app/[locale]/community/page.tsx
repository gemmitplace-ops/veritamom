import { AppShell } from '@/components/layout/AppShell';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { CommunityLeftSidebar } from '@/components/community/CommunityLeftSidebar';
import { CommunityRightSidebar } from '@/components/community/CommunityRightSidebar';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: `Veritamom — ${t('title')}` };
}

export default function CommunityPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar — 15% */}
          <aside className="hidden xl:block w-48 flex-shrink-0 pt-1">
            <div className="sticky top-24">
              <CommunityLeftSidebar />
            </div>
          </aside>

          {/* Center feed — flex-1 (~60%) */}
          <main className="flex-1 min-w-0">
            <CommunityFeed />
          </main>

          {/* Right sidebar — 25% */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <CommunityRightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
