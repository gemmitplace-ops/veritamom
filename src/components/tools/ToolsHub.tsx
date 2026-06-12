'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { PregnancyTracker } from './PregnancyTracker';
import { KickCounter } from './KickCounter';
import { ContractionTimer } from './ContractionTimer';
import { MilestoneTracker } from './MilestoneTracker';
import { BabyLogForm } from './BabyLogForm';
import { DailySummary } from './DailySummary';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { Baby, Activity, ClipboardList, BookHeart, Lock, Timer, Star } from 'lucide-react';

type Tab = 'tracker' | 'kick' | 'contractions' | 'symptoms' | 'feeding' | 'sleep' | 'diaper' | 'growth' | 'milestones' | 'summary';

const PREGNANT_TABS: Tab[] = ['tracker', 'kick', 'contractions', 'symptoms', 'summary'];
const PARENT_TABS: Tab[] = ['milestones', 'feeding', 'sleep', 'diaper', 'growth', 'symptoms', 'summary'];

export function ToolsHub() {
  const t = useTranslations();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('tracker');

  if (!user) {
    return <ToolsPreview />;
  }

  const isPostpartum = user.pregnancyStatus === 'PARENT';
  const tabs = isPostpartum ? PARENT_TABS : PREGNANT_TABS;

  // Set sensible default tab for the user's stage
  const defaultTab: Tab = isPostpartum ? 'milestones' : 'tracker';

  const tabLabels: Record<Tab, string> = {
    tracker: t('tools.pregnancyTracker'),
    kick: t('tools.kickCounter'),
    contractions: 'Contractions',
    symptoms: t('tools.symptomLog'),
    feeding: t('tools.feedingLog'),
    sleep: t('tools.sleepLog'),
    diaper: t('tools.diaperLog'),
    growth: t('tools.growthLog'),
    milestones: 'Milestones',
    summary: t('tools.dailySummary'),
  };

  const activeTab = tabs.includes(tab) ? tab : defaultTab;

  return (
    <div>
      <h1 className="font-serif text-3xl text-brand-crimson mb-6">{t('tools.title')}</h1>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {tabs.map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-full text-sm transition-colors min-h-[44px]',
              activeTab === t_
                ? 'bg-brand-crimson text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-crimson hover:text-brand-crimson'
            )}
          >
            {tabLabels[t_]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tracker' && <PregnancyTracker user={user} />}
      {activeTab === 'kick' && <KickCounter />}
      {activeTab === 'contractions' && <ContractionTimer />}
      {activeTab === 'milestones' && <MilestoneTracker />}
      {activeTab === 'symptoms' && <BabyLogForm type="SYMPTOM" />}
      {activeTab === 'feeding' && <BabyLogForm type="FEED" />}
      {activeTab === 'sleep' && <BabyLogForm type="SLEEP" />}
      {activeTab === 'diaper' && <BabyLogForm type="DIAPER" />}
      {activeTab === 'growth' && <BabyLogForm type="GROWTH" />}
      {activeTab === 'summary' && <DailySummary />}
    </div>
  );
}

/* ─── Guest preview ────────────────────────────────────────────────── */

const PREVIEW_TOOLS = [
  {
    icon: <Baby size={28} />,
    title: 'Pregnancy Tracker',
    description: 'Week-by-week progress from conception to birth with developmental highlights.',
    color: '#8B1A2B',
    bg: 'rgba(139,26,43,0.06)',
    border: 'rgba(139,26,43,0.15)',
  },
  {
    icon: <Timer size={28} />,
    title: 'Contraction Timer',
    description: 'Time contractions with gap tracking and 5-1-1 hospital-ready alerts.',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.25)',
  },
  {
    icon: <Star size={28} />,
    title: 'Milestone Tracker',
    description: 'Track your baby\'s developmental milestones across motor, language, social, and cognitive growth.',
    color: '#8B1A2B',
    bg: 'rgba(139,26,43,0.06)',
    border: 'rgba(139,26,43,0.15)',
  },
  {
    icon: <Activity size={28} />,
    title: 'Kick Counter',
    description: 'Count and log foetal movements with timestamps to share with your provider.',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.25)',
  },
  {
    icon: <ClipboardList size={28} />,
    title: 'Symptom Log',
    description: 'Record daily symptoms — nausea, fatigue, pain — and spot patterns over time.',
    color: '#8B1A2B',
    bg: 'rgba(139,26,43,0.06)',
    border: 'rgba(139,26,43,0.15)',
  },
  {
    icon: <BookHeart size={28} />,
    title: 'Baby Log',
    description: 'After birth: log feeds, sleep, diapers, and growth all in one place.',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.25)',
  },
];

function ToolsPreview() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero sign-in card */}
      <div
        className="rounded-2xl overflow-hidden mb-8 shadow-[0_4px_24px_rgba(139,26,43,0.12)]"
        style={{ background: 'linear-gradient(135deg, #8B1A2B 0%, #6d1422 100%)' }}
      >
        <div className="px-8 py-8 text-center text-white">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(201,168,76,0.2)' }}
          >
            <Baby size={26} style={{ color: '#C9A84C' }} />
          </div>
          <h1 className="font-serif text-3xl mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Baby Tools
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Track your pregnancy, time contractions, log symptoms, count kicks, and track your baby's milestones — all in one place.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C9A84C', color: '#fff' }}
          >
            Sign in to use your tools
          </Link>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No account?{' '}
            <Link href="/sign-up" className="underline" style={{ color: 'rgba(201,168,76,0.9)' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Tool preview cards */}
      <p className="text-xs font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-1.5" style={{ color: '#A88C3A' }}>
        <Lock size={11} /> What&apos;s inside
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PREVIEW_TOOLS.map((tool) => (
          <div
            key={tool.title}
            className="relative rounded-xl border overflow-hidden"
            style={{ backgroundColor: tool.bg, borderColor: tool.border }}
          >
            <div className="absolute inset-0 backdrop-blur-[1px] flex flex-col items-center justify-end pb-4 z-10">
              <span
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#8B1A2B', borderColor: 'rgba(139,26,43,0.2)' }}
              >
                <Lock size={10} /> Sign in to use
              </span>
            </div>
            <div className="p-5 select-none pointer-events-none">
              <div className="mb-3" style={{ color: tool.color }}>{tool.icon}</div>
              <h3 className="font-serif text-base mb-1.5 leading-snug" style={{ color: '#1a1a1a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {tool.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
