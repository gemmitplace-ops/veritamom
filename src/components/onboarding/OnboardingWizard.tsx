'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { COUNTRIES } from '@/lib/utils';

type Step = 1 | 2 | 3;
type Language = 'EN' | 'ZH' | 'KO';
type PregnancyStatus = 'PREGNANT' | 'PARENT' | 'TRYING' | 'PROFESSIONAL';

const languageOptions: { code: Language; label: string; native: string }[] = [
  { code: 'EN', label: 'English', native: 'English' },
  { code: 'ZH', label: 'Chinese', native: '简体中文' },
  { code: 'KO', label: 'Korean', native: '한국어' },
];

export function OnboardingWizard() {
  const t = useTranslations();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [language, setLanguage] = useState<Language>('EN');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [childBirthdate, setChildBirthdate] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!pregnancyStatus) return;
    setLoading(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          country: country || undefined,
          city: city || undefined,
          pregnancyStatus,
          dueDate: pregnancyStatus === 'PREGNANT' ? dueDate : null,
          childBirthdate: pregnancyStatus === 'PARENT' ? childBirthdate : null,
          verifiedProfessionalTitle: pregnancyStatus === 'PROFESSIONAL' ? professionalTitle : null,
        }),
      });
      await refreshUser();
      const localeMap: Record<Language, string> = { EN: 'en', ZH: 'zh', KO: 'ko' };
      router.push('/', { locale: localeMap[language] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand-crimson' : 'bg-gray-200 dark:bg-gray-700'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
        {t('onboarding.stepOf', { current: step, total: 3 })}
      </p>

      {/* Step 1: Language */}
      {step === 1 && (
        <div>
          <h1 className="font-serif text-2xl text-brand-crimson mb-1">{t('onboarding.step1Title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('onboarding.step1Subtitle')}</p>
          <div className="space-y-3">
            {languageOptions.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-colors min-h-[44px] ${
                  language === l.code
                    ? 'border-brand-crimson bg-brand-crimson/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-brand-crimson/50'
                }`}
              >
                <span className="font-medium">{l.native}</span>
                {l.native !== l.label && <span className="text-gray-500 ml-2 text-sm">· {l.label}</span>}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark min-h-[44px]"
          >
            {t('onboarding.next')}
          </button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div>
          <h1 className="font-serif text-2xl text-brand-crimson mb-1">{t('onboarding.step2Title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('onboarding.step2Subtitle')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('onboarding.country')}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
              >
                <option value="">{t('onboarding.selectCountry')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('onboarding.city')}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('onboarding.city')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px]"
            >
              {t('onboarding.back')}
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark min-h-[44px]"
            >
              {t('onboarding.next')}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Status */}
      {step === 3 && (
        <div>
          <h1 className="font-serif text-2xl text-brand-crimson mb-1">{t('onboarding.step3Title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('onboarding.step3Subtitle')}</p>
          <div className="space-y-3">
            {[
              { value: 'PREGNANT', label: 'onboarding.pregnantOption' },
              { value: 'PARENT', label: 'onboarding.parentOption' },
              { value: 'TRYING', label: 'onboarding.tryingOption' },
              { value: 'PROFESSIONAL', label: 'onboarding.professionalOption' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPregnancyStatus(value as PregnancyStatus)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-colors min-h-[44px] ${
                  pregnancyStatus === value
                    ? 'border-brand-crimson bg-brand-crimson/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-brand-crimson/50'
                }`}
              >
                {t(label as never)}
              </button>
            ))}
          </div>

          {pregnancyStatus === 'PREGNANT' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('onboarding.dueDate')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
              />
            </div>
          )}

          {pregnancyStatus === 'PARENT' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('onboarding.childBirthdate')}
              </label>
              <input
                type="date"
                value={childBirthdate}
                onChange={(e) => setChildBirthdate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
              />
            </div>
          )}

          {pregnancyStatus === 'PROFESSIONAL' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('onboarding.professionalTitle')}
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder={t('onboarding.professionalPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson min-h-[44px]"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px]"
            >
              {t('onboarding.back')}
            </button>
            <button
              onClick={handleFinish}
              disabled={!pregnancyStatus || loading}
              className="flex-1 py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark disabled:opacity-50 min-h-[44px]"
            >
              {loading ? t('common.loading') : t('onboarding.finish')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
