import { SignInForm } from '@/components/auth/SignInForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: `Veritamom — ${t('signInTitle')}` };
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-cream dark:bg-gray-950">
      <SignInForm />
    </div>
  );
}
