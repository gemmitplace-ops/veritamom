import { SignUpForm } from '@/components/auth/SignUpForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: `Veritamom — ${t('signUpTitle')}` };
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-cream dark:bg-gray-950">
      <SignUpForm />
    </div>
  );
}
