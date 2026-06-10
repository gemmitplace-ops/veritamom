import { AppShell } from '@/components/layout/AppShell';
import { ToolsHub } from '@/components/tools/ToolsHub';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'tools' });
  return { title: `Veritamom — ${t('title')}` };
}

export default function ToolsPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AppShell locale={locale}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ToolsHub />
      </div>
    </AppShell>
  );
}
