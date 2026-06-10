import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export function generateMetadata() {
  return { title: 'Veritamom — Welcome' };
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <OnboardingWizard />
    </div>
  );
}
