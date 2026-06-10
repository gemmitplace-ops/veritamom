import { AppShell } from '@/components/layout/AppShell';
import { PostDetail } from '@/components/community/PostDetail';

export default function PostDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  return (
    <AppShell locale={locale}>
      <PostDetail postId={id} locale={locale} />
    </AppShell>
  );
}
