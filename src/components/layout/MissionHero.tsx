'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Heart, BookOpen, Wrench } from 'lucide-react';

export function MissionHero() {
  const t = useTranslations('mission');

  return (
    <div className="mb-8">
      {/* Hero */}
      <div
        className="rounded-2xl px-6 py-10 md:px-12 md:py-14 mb-6 relative overflow-hidden"
        style={{ backgroundColor: '#FAF8F3', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        {/* Decorative background circle */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: '#8B1A2B' }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-5"
          style={{ backgroundColor: '#C9A84C' }}
        />

        <div className="relative z-10 max-w-2xl">
          {/* Nonprofit badge */}
          <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#A88C3A' }}>
            <Heart size={10} strokeWidth={2.5} />
            {t('badge')}
          </div>

          <h1
            className="font-serif text-3xl md:text-4xl leading-tight mb-4"
            style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {t('headline')}
          </h1>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6 max-w-xl">
            {t('subheadline')}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              {t('cta')}
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
              style={{ color: '#8B1A2B', border: '1.5px solid rgba(139,26,43,0.3)' }}
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>

      {/* Mission statement */}
      <div
        className="rounded-xl px-5 py-4 mb-6 border-l-4"
        style={{ backgroundColor: 'rgba(139,26,43,0.04)', borderLeftColor: '#8B1A2B' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: '#A88C3A' }}>
          {t('missionLabel')}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed italic">
          "{t('missionStatement')}"
        </p>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { icon: Heart, statKey: 'stat1Value', labelKey: 'stat1Label' },
          { icon: BookOpen, statKey: 'stat2Value', labelKey: 'stat2Label' },
          { icon: Wrench, statKey: 'stat3Value', labelKey: 'stat3Label' },
        ].map(({ icon: Icon, statKey, labelKey }) => (
          <div
            key={statKey}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: '#FAF8F3', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <Icon size={16} className="mx-auto mb-1.5" style={{ color: '#C9A84C' }} />
            <p className="font-serif font-bold text-lg leading-none mb-0.5" style={{ color: '#8B1A2B' }}>
              {t(statKey as never)}
            </p>
            <p className="text-[10px] text-gray-500 leading-tight">{t(labelKey as never)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
