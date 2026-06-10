'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getPregnancyWeek, getDaysUntilDue } from '@/lib/utils';

interface MilestoneWeek {
  week: number;
  title: string;
  description: string;
  babySize: string;
  babySizeComparison: string;
  developmentHighlights: string;
}

export function PregnancyTracker({ user }: { user: { dueDate: string | null } }) {
  const t = useTranslations();
  const [milestone, setMilestone] = useState<MilestoneWeek | null>(null);
  const [loading, setLoading] = useState(false);

  const week = user.dueDate ? getPregnancyWeek(user.dueDate) : null;
  const daysLeft = user.dueDate ? getDaysUntilDue(user.dueDate) : null;
  const progress = week ? ((week - 4) / (40 - 4)) * 100 : 0;

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    fetch(`/api/milestones/${week}`)
      .then((r) => r.json())
      .then((data) => setMilestone(data.milestone))
      .finally(() => setLoading(false));
  }, [week]);

  if (!user.dueDate) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No due date set. Update your profile to use the pregnancy tracker.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week display */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('tools.weekProgress', { week: week ?? 0 })}
            </p>
            <p className="text-4xl font-serif text-brand-crimson font-bold mt-1">Week {week}</p>
          </div>
          {daysLeft !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.daysLeft', { days: daysLeft })}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-crimson rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Week 4</span>
          <span>Week 40</span>
        </div>
      </div>

      {/* Milestone info */}
      {loading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        </div>
      )}

      {milestone && !loading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{milestone.babySizeComparison}</div>
            <div>
              <h3 className="font-serif text-lg text-brand-crimson">{t('tools.babyThisWeek')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                About the size of a {milestone.babySize}
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{milestone.title}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{milestone.description}</p>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {t('tools.developmentHighlights')}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {milestone.developmentHighlights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
