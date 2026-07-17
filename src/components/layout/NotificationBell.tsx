import { Bell, Cake } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMarkNotifRead, useNotifications } from '@/api/hooks';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDateTime } from '@/lib/utils';
import { useLiveNotifStore } from '@/store/live-notif.store';

/**
 * Real-time notification bell. The badge reads the live unread count (kept
 * fresh by the socket); the popover shows the latest few unread and links to the
 * full page. Clicking one marks it read.
 */
export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = useLiveNotifStore((s) => s.unread);
  const markRead = useMarkNotifRead();

  // The 6 latest unread for the preview. The badge count itself comes from the
  // live socket store, so this only needs to run to populate the popover; a new
  // arrival invalidates ['notifications'] and refetches it.
  const { data } = useNotifications({ isRead: false, limit: 6, page: 1 });
  const items = data?.items ?? [];

  // Clicking marks the item read; a birthday notification also jumps to the
  // Birthdays page (its refId is the employee whose birthday it is).
  const onItemClick = (n: (typeof items)[number]) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.type.startsWith('birthday')) {
      setOpen(false);
      navigate('/birthdays');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-full border border-border p-2 transition-colors hover:bg-accent"
          title={t('notifications.title')}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="brand-gradient absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="font-semibold">{t('notifications.title')}</span>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('notifications.unread_count', { count: unread })}
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('notifications.none_unread')}
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => onItemClick(n)}
                className="flex w-full items-start gap-3 rounded-md p-2 text-left hover:bg-accent"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {n.type.startsWith('birthday') ? (
                    <Cake className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{n.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => {
            setOpen(false);
            navigate('/notifications');
          }}
          className="w-full border-t border-border p-2.5 text-center text-sm font-medium text-primary hover:bg-accent"
        >
          {t('notifications.view_all')}
        </button>
      </PopoverContent>
    </Popover>
  );
}
