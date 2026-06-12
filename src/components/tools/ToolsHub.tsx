'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PregnancyTracker } from './PregnancyTracker';
import { KickCounter } from './KickCounter';
import { ContractionTimer } from './ContractionTimer';
import { MilestoneTracker } from './MilestoneTracker';
import { BabyLogForm } from './BabyLogForm';
import { DailySummary } from './DailySummary';
import { GrowthTracker } from './GrowthTracker';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  Baby, Activity, Timer, Star, ClipboardList, Droplets,
  Moon, Trash2, TrendingUp, BookOpen, Lock, ChevronLeft,
  Smile, Heart,
} from 'lucide-react';

type ToolId =
  | 'tracker' | 'kick' | 'contractions' | 'symptoms'
  | 'milestones' | 'feeding' | 'sleep' | 'diaper' | 'growth' | 'summary';

interface ToolDef {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  section: 'pregnancy' | 'newborn' | 'general';
  forStatuses: string[]; // which pregnancyStatus values see this
}

const TOOLS: ToolDef[] = [
  // Pregnancy section
  { id: 'tracker',      label: 'Pregnancy\nTracker',  icon: <Baby size={26} />,         color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)',  section: 'pregnancy', forStatuses: ['PREGNANT', 'TRYING'] },
  { id: 'kick',         label: 'Kick\nCounter',        icon: <Activity size={26} />,     color: '#C9A84C', bg: 'rgba(201,168,76,0.12)',  section: 'pregnancy', forStatuses: ['PREGNANT'] },
  { id: 'contractions', label: 'Contraction\nTimer',   icon: <Timer size={26} />,        color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)',  section: 'pregnancy', forStatuses: ['PREGNANT'] },
  { id: 'symptoms',     label: 'Symptom\nLog',         icon: <ClipboardList size={26} />,color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', section: 'pregnancy', forStatuses: ['PREGNANT', 'TRYING', 'PARENT', 'PROFESSIONAL'] },
  // Newborn / Baby section
  { id: 'milestones',   label: 'Milestone\nTracker',   icon: <Star size={26} />,         color: '#C9A84C', bg: 'rgba(201,168,76,0.12)',  section: 'newborn', forStatuses: ['PARENT'] },
  { id: 'feeding',      label: 'Feeding\nLog',         icon: <Droplets size={26} />,     color: '#2d7a4f', bg: 'rgba(45,122,79,0.10)',   section: 'newborn', forStatuses: ['PARENT'] },
  { id: 'sleep',        label: 'Sleep\nLog',           icon: <Moon size={26} />,         color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', section: 'newborn', forStatuses: ['PARENT'] },
  { id: 'diaper',       label: 'Diaper\nLog',          icon: <Trash2 size={26} />,       color: '#b45309', bg: 'rgba(180,83,9,0.10)',    section: 'newborn', forStatuses: ['PARENT'] },
  { id: 'growth',       label: 'Growth\nChart',         icon: <TrendingUp size={26} />,   color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)',  section: 'newborn', forStatuses: ['PARENT'] },
  // General
  { id: 'summary',      label: 'Daily\nSummary',       icon: <BookOpen size={26} />,     color: '#4b5563', bg: 'rgba(75,85,99,0.10)',    section: 'general', forStatuses: ['PREGNANT', 'PARENT', 'TRYING', 'PROFESSIONAL'] },
];

const SECTION_LABELS: Record<string, string> = {
  pregnancy: 'During Pregnancy',
  newborn: 'Baby & Newborn',
  general: 'General',
};

const COMPONENTS: Record<ToolId, React.ReactNode | null> = {
  tracker: null, // needs user prop — handled specially
  kick: <KickCounter />,
  contractions: <ContractionTimer />,
  symptoms: <BabyLogForm type="SYMPTOM" />,
  milestones: <MilestoneTracker />,
  feeding: <BabyLogForm type="FEED" />,
  sleep: <BabyLogForm type="SLEEP" />,
  diaper: <BabyLogForm type="DIAPER" />,
  growth: <GrowthTracker />,
  summary: <DailySummary />,
};

export function ToolsHub() {
  const { user } = useAuth();
  const [active, setActive] = useState<ToolId | null>(null);

  if (!user) return <ToolsPreview />;

  // Filter tools for this user
  const visibleTools = TOOLS.filter((t) => t.forStatuses.includes(user.pregnancyStatus));
  const sections = ['pregnancy', 'newborn', 'general'].filter((s) =>
    visibleTools.some((t) => t.section === s)
  );

  // Tool detail view
  if (active) {
    const tool = TOOLS.find((t) => t.id === active)!;
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Tools
        </button>
        {active === 'tracker'
          ? <PregnancyTracker user={user} />
          : COMPONENTS[active]}
      </div>
    );
  }

  // Grid home screen
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-brand-crimson">Baby Tools</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track every stage of your journey</p>
      </div>

      {sections.map((section) => {
        const tools = visibleTools.filter((t) => t.section === section);
        return (
          <div key={section}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
              {SECTION_LABELS[section]}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActive(tool.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-gold/40 hover:shadow-md active:scale-95 transition-all"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: tool.bg, color: tool.color }}
                  >
                    {tool.icon}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight text-center whitespace-pre-line">
                    {tool.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Guest preview ─────────────────────────────────────────────────── */

const PREVIEW_TOOLS: Array<{ label: string; icon: React.ReactNode; color: string; bg: string }> = [
  { label: 'Pregnancy\nTracker',  icon: <Baby size={24} />,         color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)' },
  { label: 'Kick\nCounter',       icon: <Activity size={24} />,     color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  { label: 'Contraction\nTimer',  icon: <Timer size={24} />,        color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)' },
  { label: 'Milestone\nTracker',  icon: <Star size={24} />,         color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  { label: 'Feeding\nLog',        icon: <Droplets size={24} />,     color: '#2d7a4f', bg: 'rgba(45,122,79,0.10)' },
  { label: 'Sleep\nLog',          icon: <Moon size={24} />,         color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  { label: 'Diaper\nLog',         icon: <Trash2 size={24} />,       color: '#b45309', bg: 'rgba(180,83,9,0.10)' },
  { label: 'Growth\nChart',        icon: <TrendingUp size={24} />,   color: '#8B1A2B', bg: 'rgba(139,26,43,0.10)' },
  { label: 'Symptom\nLog',        icon: <ClipboardList size={24} />,color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
];

function ToolsPreview() {
  return (
    <div>
      {/* Hero */}
      <div
        className="rounded-2xl overflow-hidden mb-8 shadow-[0_4px_24px_rgba(139,26,43,0.12)]"
        style={{ background: 'linear-gradient(135deg, #8B1A2B 0%, #6d1422 100%)' }}
      >
        <div className="px-6 py-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: 'rgba(201,168,76,0.2)' }}>
            <Heart size={26} style={{ color: '#C9A84C' }} />
          </div>
          <h1 className="font-serif text-3xl mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Baby Tools</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Pregnancy tracker, contraction timer, milestone tracker, feeding log — everything in one place.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm"
            style={{ backgroundColor: '#C9A84C', color: '#fff' }}
          >
            Sign in to use your tools
          </Link>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No account?{' '}
            <Link href="/sign-up" className="underline" style={{ color: 'rgba(201,168,76,0.9)' }}>Create one free</Link>
          </p>
        </div>
      </div>

      {/* Preview grid */}
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-1.5" style={{ color: '#A88C3A' }}>
        <Lock size={11} /> What&apos;s inside
      </p>
      <div className="grid grid-cols-3 gap-3">
        {PREVIEW_TOOLS.map((tool) => (
          <div
            key={tool.label}
            className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-white relative overflow-hidden')}
          >
            {/* Lock overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-end justify-center pb-2 z-10">
              <Lock size={12} className="text-gray-400" />
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tool.bg, color: tool.color }}>
              {tool.icon}
            </div>
            <span className="text-[11px] font-medium text-gray-700 leading-tight text-center whitespace-pre-line select-none">
              {tool.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
