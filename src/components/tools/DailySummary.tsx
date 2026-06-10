'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface Log {
  id: string;
  type: string;
  startTime: string;
  endTime: string | null;
  notes: string | null;
  value: string | null;
}

export function DailySummary() {
  const t = useTranslations();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetch(`/api/baby-logs?date=${today}`)
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, [today]);

  const grouped = logs.reduce<Record<string, Log[]>>((acc, log) => {
    acc[log.type] = acc[log.type] || [];
    acc[log.type].push(log);
    return acc;
  }, {});

  const typeIcons: Record<string, string> = {
    FEED: '🍼', SLEEP: '😴', DIAPER: '🧷', GROWTH: '📏', SYMPTOM: '💊', KICK: '👶',
  };

  return (
    <div>
      <h2 className="font-serif text-xl text-brand-crimson mb-4">{t('tools.dailySummary')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{format(new Date(), 'MMMM d, yyyy')}</p>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>{t('tools.noLogsToday')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([type, typeLogs]) => (
            <div key={type} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{typeIcons[type] || '📝'}</span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{type}</h3>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{typeLogs.length}x</span>
              </div>
              <div className="space-y-1.5">
                {typeLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                    <span>{format(new Date(log.startTime), 'HH:mm')}</span>
                    {log.value && <span className="text-gray-500">·</span>}
                    {log.value && <span>{log.value}</span>}
                    {log.notes && <span className="text-gray-400 truncate">{log.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
