'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TaxonomySidebarProps {
  activeTag?: string;
  onTagSelect?: (tag: string) => void;
}

export function TaxonomySidebar({ activeTag, onTagSelect }: TaxonomySidebarProps) {
  const t = useTranslations('taxonomy');
  const [expanded, setExpanded] = useState<string | null>('trimesters');

  const taxonomy = [
    { key: 'trimesters', sub: ['first', 'second', 'third'] },
    { key: 'developmentalPhases', sub: [] },
    { key: 'toxins', sub: [] },
    { key: 'nutrition', sub: [] },
    { key: 'mentalHealth', sub: [] },
    { key: 'medications', sub: [] },
    { key: 'labourBirth', sub: [] },
    { key: 'postpartum', sub: [] },
    { key: 'breastfeeding', sub: [] },
    { key: 'productSafety', sub: [] },
  ];

  return (
    <aside className="w-full">
      <div className="mb-4 pb-3 border-b border-brand-gold/30">
        <h2 className="font-serif text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
          {t('title')}
        </h2>
      </div>

      <nav className="space-y-px">
        {taxonomy.map(({ key, sub }) => (
          <div key={key}>
            <button
              onClick={() => {
                setExpanded(expanded === key ? null : key);
                onTagSelect?.(t(key as never));
              }}
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-between',
                activeTag === t(key as never)
                  ? 'bg-brand-crimson/8 text-brand-crimson font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-brand-crimson/6 hover:text-brand-crimson'
              )}
            >
              <span>{t(key as never)}</span>
              {sub.length > 0 && (
                <span className={cn(
                  'text-gray-400 text-xs transition-transform duration-150 inline-block',
                  expanded === key ? 'rotate-90' : ''
                )}>›</span>
              )}
            </button>

            {sub.length > 0 && expanded === key && (
              <div className="ml-4 mt-0.5 mb-1.5 space-y-px border-l-2 border-brand-gold/25 pl-3">
                {sub.map((s) => (
                  <button
                    key={s}
                    onClick={() => onTagSelect?.(t(s as never))}
                    className={cn(
                      'w-full text-left text-xs px-2 py-2 rounded-md transition-all',
                      activeTag === t(s as never)
                        ? 'text-brand-crimson font-semibold bg-brand-crimson/5'
                        : 'text-gray-500 dark:text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/5'
                    )}
                  >
                    {t(s as never)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">{t('popularTags')}</p>
        <div className="flex flex-wrap gap-1.5">
          {['Omega-3', 'Folic Acid', 'Sleep', 'Anxiety', 'Exercise', 'Vaccines', 'Iron'].map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect?.(tag)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-brand-gold/30 text-brand-gold-dark hover:bg-brand-gold/10 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
