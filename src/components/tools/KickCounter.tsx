'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface Kick {
  time: Date;
}

export function KickCounter() {
  const t = useTranslations();
  const [sessionKicks, setSessionKicks] = useState<Kick[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    // Load today's kicks from API
    const today = format(new Date(), 'yyyy-MM-dd');
    fetch(`/api/baby-logs?type=KICK&date=${today}`)
      .then((r) => r.json())
      .then((data) => setTodayTotal(data.logs?.length || 0));
  }, []);

  async function handleTap() {
    const kickTime = new Date();
    setSessionKicks((k) => [...k, { time: kickTime }]);

    fetch('/api/baby-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'KICK',
        startTime: kickTime.toISOString(),
        value: '1',
      }),
    }).then(() => setTodayTotal((n) => n + 1));
  }

  function handleReset() {
    setSessionKicks([]);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-brand-crimson mb-1">{t('tools.kickCounterTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.kicksToday', { count: todayTotal + sessionKicks.length })}</p>
      </div>

      {/* Big tap button */}
      <div className="flex justify-center">
        <button
          onPointerDown={handleTap}
          className="w-48 h-48 rounded-full bg-brand-crimson text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform select-none touch-none"
          style={{ WebkitUserSelect: 'none' }}
        >
          <span className="text-5xl font-bold">{sessionKicks.length}</span>
          <span className="text-lg mt-1 opacity-80">{t('tools.tap')}</span>
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tools.kicksThisSession', { count: sessionKicks.length })}
        </p>
        {sessionKicks.length > 0 && (
          <button
            onClick={handleReset}
            className="mt-2 text-sm text-brand-crimson hover:underline"
          >
            {t('tools.resetSession')}
          </button>
        )}
      </div>

      {/* Recent kicks */}
      {sessionKicks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Recent kicks
          </p>
          <div className="flex flex-wrap gap-2">
            {sessionKicks.slice(-10).reverse().map((k, i) => (
              <span key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                {format(k.time, 'HH:mm:ss')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
