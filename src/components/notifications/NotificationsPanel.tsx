'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Bell, UserPlus, MessageCircle, AtSign, CalendarDays, CheckCheck } from 'lucide-react';
import { formatRelativeTime, cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'REPLY' | 'FOLLOW' | 'MENTION' | 'WEEKLY_UPDATE';
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  REPLY: MessageCircle,
  FOLLOW: UserPlus,
  MENTION: AtSign,
  WEEKLY_UPDATE: CalendarDays,
};

const typeColors: Record<string, string> = {
  REPLY: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  FOLLOW: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  MENTION: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  WEEKLY_UPDATE: 'bg-brand-gold/20 text-brand-gold-dark dark:bg-brand-gold/10',
};

export function NotificationsPanel() {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => { setNotifications(d.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function markAllRead() {
    setMarking(true);
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brand-crimson">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="flex items-center gap-2 text-sm text-brand-crimson hover:underline disabled:opacity-50"
          >
            <CheckCheck size={15} />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-brand-crimson/10 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-brand-crimson/40" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">{t('notifications.noNotifications')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || 'bg-gray-100 text-gray-600';
            const content = (
              <div className={cn(
                'flex gap-3 p-4 rounded-xl border transition-colors',
                notif.isRead
                  ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  : 'bg-brand-cream dark:bg-gray-800/60 border-brand-crimson/10 dark:border-brand-crimson/20'
              )}>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', colorClass)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug', notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-medium')}>
                    {notif.title}
                  </p>
                  {notif.body && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-brand-crimson flex-shrink-0 mt-2" />
                )}
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} href={notif.link as never}>{content}</Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
