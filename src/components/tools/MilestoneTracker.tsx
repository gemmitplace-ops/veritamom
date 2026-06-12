'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Star, Baby, Footprints, Brain, MessageCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  label: string;
  typicalAge: string; // e.g. "1–2 months"
  note?: string;
}

interface MilestoneGroup {
  category: string;
  icon: React.ReactNode;
  color: string;
  milestones: Milestone[];
}

const MILESTONE_GROUPS: MilestoneGroup[] = [
  {
    category: 'Social & Emotional',
    icon: <Heart size={16} />,
    color: '#8B1A2B',
    milestones: [
      { id: 'sm1', label: 'First smile (social)', typicalAge: '1–2 months' },
      { id: 'sm2', label: 'Recognizes familiar faces', typicalAge: '2–3 months' },
      { id: 'sm3', label: 'Laughs out loud', typicalAge: '3–4 months' },
      { id: 'sm4', label: 'Enjoys playing with others', typicalAge: '3–6 months' },
      { id: 'sm5', label: 'Stranger anxiety begins', typicalAge: '6–9 months' },
      { id: 'sm6', label: 'Waves bye-bye', typicalAge: '9–10 months' },
      { id: 'sm7', label: 'Shows affection (hugs, kisses)', typicalAge: '12 months' },
      { id: 'sm8', label: 'Parallel play with other children', typicalAge: '18–24 months' },
    ],
  },
  {
    category: 'Language & Communication',
    icon: <MessageCircle size={16} />,
    color: '#C9A84C',
    milestones: [
      { id: 'lc1', label: 'Coos and makes sounds', typicalAge: '1–2 months' },
      { id: 'lc2', label: 'Babbles (ba-ba, da-da)', typicalAge: '4–6 months' },
      { id: 'lc3', label: 'Responds to own name', typicalAge: '6–9 months' },
      { id: 'lc4', label: 'Says "mama" or "dada" with meaning', typicalAge: '9–12 months' },
      { id: 'lc5', label: 'Understands simple words (no, yes)', typicalAge: '9–12 months' },
      { id: 'lc6', label: 'First clear word', typicalAge: '12 months', note: 'Typically 1+ words beyond mama/dada' },
      { id: 'lc7', label: '2-word phrases ("more milk")', typicalAge: '18–24 months' },
      { id: 'lc8', label: '50+ word vocabulary', typicalAge: '24 months' },
    ],
  },
  {
    category: 'Cognitive',
    icon: <Brain size={16} />,
    color: '#2d7a4f',
    milestones: [
      { id: 'cg1', label: 'Tracks moving objects with eyes', typicalAge: '1–2 months' },
      { id: 'cg2', label: 'Recognizes familiar objects', typicalAge: '3–6 months' },
      { id: 'cg3', label: 'Object permanence (searches for hidden toy)', typicalAge: '6–9 months' },
      { id: 'cg4', label: 'Imitates actions (clapping, waving)', typicalAge: '9–12 months' },
      { id: 'cg5', label: 'Points to show interest', typicalAge: '12 months' },
      { id: 'cg6', label: 'Pretend play (feeding doll, phone)', typicalAge: '12–18 months' },
      { id: 'cg7', label: 'Sorts shapes and colors', typicalAge: '18–24 months' },
      { id: 'cg8', label: 'Follows 2-step instructions', typicalAge: '24 months' },
    ],
  },
  {
    category: 'Gross Motor',
    icon: <Footprints size={16} />,
    color: '#7c3aed',
    milestones: [
      { id: 'gm1', label: 'Holds head up briefly (tummy time)', typicalAge: '1 month' },
      { id: 'gm2', label: 'Holds head steady', typicalAge: '3–4 months' },
      { id: 'gm3', label: 'Rolls over (front to back)', typicalAge: '3–5 months' },
      { id: 'gm4', label: 'Sits without support', typicalAge: '6–8 months' },
      { id: 'gm5', label: 'Crawls', typicalAge: '7–10 months', note: 'Some babies skip crawling — that\'s OK' },
      { id: 'gm6', label: 'Pulls to stand', typicalAge: '9–12 months' },
      { id: 'gm7', label: 'First steps (cruising furniture)', typicalAge: '9–12 months' },
      { id: 'gm8', label: 'Walks independently', typicalAge: '12–15 months' },
      { id: 'gm9', label: 'Runs', typicalAge: '18 months' },
      { id: 'gm10', label: 'Kicks a ball', typicalAge: '18–24 months' },
      { id: 'gm11', label: 'Climbs stairs (with help)', typicalAge: '18–24 months' },
      { id: 'gm12', label: 'Jumps with both feet', typicalAge: '24 months' },
    ],
  },
  {
    category: 'Fine Motor',
    icon: <Baby size={16} />,
    color: '#b45309',
    milestones: [
      { id: 'fm1', label: 'Grasps objects placed in hand', typicalAge: '1–3 months' },
      { id: 'fm2', label: 'Reaches for dangling toys', typicalAge: '3–5 months' },
      { id: 'fm3', label: 'Transfers objects hand-to-hand', typicalAge: '5–7 months' },
      { id: 'fm4', label: 'Pincer grasp (thumb + forefinger)', typicalAge: '9–10 months' },
      { id: 'fm5', label: 'Drops and picks up objects intentionally', typicalAge: '9–12 months' },
      { id: 'fm6', label: 'Stacks 2 blocks', typicalAge: '12 months' },
      { id: 'fm7', label: 'Scribbles with crayon', typicalAge: '12–18 months' },
      { id: 'fm8', label: 'Stacks 6+ blocks', typicalAge: '18–24 months' },
    ],
  },
];

export function MilestoneTracker() {
  const [achieved, setAchieved] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState(MILESTONE_GROUPS[0].category);

  function toggle(id: string) {
    setAchieved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalAll = MILESTONE_GROUPS.reduce((s, g) => s + g.milestones.length, 0);
  const achievedAll = achieved.size;

  const activeGroup = MILESTONE_GROUPS.find((g) => g.category === category)!;
  const groupAchieved = activeGroup.milestones.filter((m) => achieved.has(m.id)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl text-brand-crimson mb-1">Milestone Tracker</h2>
          <p className="text-sm text-gray-500">Track your baby's developmental journey (0–24 months)</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold" style={{ color: '#8B1A2B' }}>{achievedAll}<span className="text-base font-normal text-gray-400">/{totalAll}</span></p>
          <p className="text-[11px] text-gray-400">milestones</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(achievedAll / totalAll) * 100}%`, backgroundColor: '#8B1A2B' }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {MILESTONE_GROUPS.map((g) => {
          const done = g.milestones.filter((m) => achieved.has(m.id)).length;
          return (
            <button
              key={g.category}
              onClick={() => setCategory(g.category)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border min-h-[36px]',
                category === g.category
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              )}
              style={category === g.category ? { backgroundColor: g.color, borderColor: g.color } : {}}
            >
              <span style={{ color: category === g.category ? 'white' : g.color }}>{g.icon}</span>
              {g.category}
              <span className={cn('text-[10px] font-bold', category === g.category ? 'text-white/70' : 'text-gray-400')}>
                {done}/{g.milestones.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Milestone list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ color: activeGroup.color }}>
            {activeGroup.category}
          </h3>
          <span className="text-xs text-gray-400">{groupAchieved}/{activeGroup.milestones.length} done</span>
        </div>

        {activeGroup.milestones.map((m) => {
          const done = achieved.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all',
                done
                  ? 'border-transparent'
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200'
              )}
              style={done ? { backgroundColor: `${activeGroup.color}08`, borderColor: `${activeGroup.color}30` } : {}}
            >
              {done
                ? <CheckCircle size={20} style={{ color: activeGroup.color }} className="flex-shrink-0 mt-0.5" />
                : <Circle size={20} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium leading-snug', done ? 'line-through opacity-60' : 'text-gray-800 dark:text-gray-200')}>
                  {m.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Star size={9} /> Typical: {m.typicalAge}
                  </span>
                  {m.note && <span className="text-[11px] text-gray-400 italic">· {m.note}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl p-3.5 text-xs text-gray-500 border border-brand-gold/20" style={{ backgroundColor: '#FAF8F3' }}>
        <strong className="text-gray-700">Remember:</strong> Milestones are ranges, not deadlines. Every baby develops at their own pace.
        If you have concerns, speak with your pediatrician — they&apos;re your best resource.
      </div>
    </div>
  );
}
