import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { initNotifSound, playNotifSound } from '@/lib/notif-sound';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { useLiveNotifStore } from '@/store/live-notif.store';

/**
 * Wires the real-time notification channel. Call once, high in the tree
 * (AppLayout): connects the socket while logged in, keeps the unread badge live,
 * and rings the chime + refreshes the list when a notification arrives.
 */
export function useNotificationSocket() {
  const user = useAuthStore((s) => s.user);
  const setUnread = useLiveNotifStore((s) => s.setUnread);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setUnread(0);
      return;
    }

    initNotifSound();

    // Seed the badge immediately; the socket then keeps it current (and re-syncs
    // its own count on connect, so a missed event self-heals on reconnect).
    api
      .get<{ count: number }>('/notifications/unread-count')
      .then((r) => setUnread((r.data as { count?: number })?.count ?? 0))
      .catch(() => {});

    const s = connectSocket();

    const onUnread = (d: { count?: number }) => setUnread(d?.count ?? 0);
    const onNotification = () => {
      playNotifSound();
      // Any open notification list / badge query should refetch.
      qc.invalidateQueries({ queryKey: ['notifications'] });
    };

    s.on('unread', onUnread);
    s.on('notification', onNotification);

    return () => {
      const sock = getSocket();
      sock.off('unread', onUnread);
      sock.off('notification', onNotification);
    };
  }, [user, setUnread, qc]);
}
