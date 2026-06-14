'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export function useUnreadCount() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) { setUnread(0); return; }
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const d = await res.json();
        setUnread(d.unreadCount ?? 0);
      }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000); // poll every 30s
    return () => clearInterval(id);
  }, [refresh]);

  return { unread, refresh };
}
