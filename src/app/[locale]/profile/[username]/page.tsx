import { AppShell } from '@/components/layout/AppShell';
import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage({ params }: { params: { locale: string; username: string } }) {
  return (
    <AppShell locale={params.locale}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <UserProfile username={params.username} />
      </div>
    </AppShell>
  );
}
