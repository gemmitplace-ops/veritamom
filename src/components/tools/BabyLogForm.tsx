'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

type LogType = 'FEED' | 'SLEEP' | 'DIAPER' | 'GROWTH' | 'SYMPTOM' | 'KICK';

const SYMPTOM_OPTIONS = ['nausea', 'fatigue', 'backPain', 'headache', 'swelling', 'heartburn', 'insomnia', 'other'];

export function BabyLogForm({ type }: { type: LogType }) {
  const t = useTranslations();
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [value, setValue] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const finalValue = type === 'SYMPTOM' ? selectedSymptoms.join(',') : value;
    const finalNotes = type === 'SYMPTOM' ? notes : notes;

    try {
      await fetch('/api/baby-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          startTime: new Date(startTime).toISOString(),
          endTime: endTime ? new Date(endTime).toISOString() : null,
          notes: finalNotes || null,
          value: finalValue || null,
        }),
      });
      setSuccess(true);
      setNotes('');
      setValue('');
      setSelectedSymptoms([]);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  function toggleSymptom(s: string) {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  const titles: Record<LogType, string> = {
    FEED: t('tools.logFeed'),
    SLEEP: t('tools.logSleep'),
    DIAPER: t('tools.logDiaper'),
    GROWTH: t('tools.logGrowth'),
    SYMPTOM: t('tools.addSymptom'),
    KICK: t('tools.kickCounterTitle'),
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h2 className="font-serif text-xl text-brand-crimson mb-4">{titles[type]}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Start time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.startTime')}</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[44px]"
          />
        </div>

        {/* End time for FEED/SLEEP */}
        {(type === 'FEED' || type === 'SLEEP') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.endTime')}</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[44px]"
            />
          </div>
        )}

        {/* Feed-specific */}
        {type === 'FEED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.feedSide')}</label>
            <div className="flex gap-2 flex-wrap">
              {['LEFT', 'RIGHT', 'BOTH', 'BOTTLE'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className={`px-3 py-2 rounded-lg border text-sm min-h-[44px] transition-colors ${value === s ? 'border-brand-crimson bg-brand-crimson/5 text-brand-crimson' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t(`tools.feed${s.charAt(0) + s.slice(1).toLowerCase()}` as never)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Diaper type */}
        {type === 'DIAPER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.diaperType')}</label>
            <div className="flex gap-2 flex-wrap">
              {['WET', 'DIRTY', 'BOTH'].map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setValue(dt)}
                  className={`px-3 py-2 rounded-lg border text-sm min-h-[44px] transition-colors ${value === dt ? 'border-brand-crimson bg-brand-crimson/5 text-brand-crimson' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t(`tools.diaper${dt.charAt(0) + dt.slice(1).toLowerCase()}` as never)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptom picker */}
        {type === 'SYMPTOM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-2 rounded-lg border text-sm min-h-[44px] transition-colors ${selectedSymptoms.includes(s) ? 'border-brand-crimson bg-brand-crimson/5 text-brand-crimson' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t(`tools.symptoms.${s}` as never)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Growth fields */}
        {type === 'GROWTH' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.weight')}</label>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[44px]"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-crimson text-white rounded-lg font-medium hover:bg-brand-crimson-dark disabled:opacity-50 min-h-[44px]"
        >
          {loading ? t('common.loading') : success ? '✓ Saved!' : t('tools.save')}
        </button>
      </form>
    </div>
  );
}
