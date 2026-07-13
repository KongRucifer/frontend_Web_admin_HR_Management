import { Bell, Cake } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBirthdays } from '@/api/hooks';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotificationStore } from '@/store/notifications.store';
import type { Birthday } from '@/types';

/** Today's local (Vientiane) date as YYYY-MM-DD. */
function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Vientiane' });
}

/** The date the birthday actually occurs (today + daysLeft), used as a stable
 *  per-occurrence key so "read" resets automatically next year. */
function occurrenceKey(b: Birthday) {
  const d = new Date(`${todayStr()}T00:00:00`);
  d.setDate(d.getDate() + b.daysLeft);
  return `bday:${b.id}:${d.toISOString().slice(0, 10)}`;
}

export function BirthdayBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data } = useBirthdays(2);
  const read = useNotificationStore((s) => s.read);
  const markRead = useNotificationStore((s) => s.markRead);

  const today = data?.today ?? [];
  const upcoming = data?.upcoming ?? [];

  // Build notifications, then keep only UNREAD ones.
  const notifs = [
    ...today.map((b) => ({ b, key: occurrenceKey(b), label: t('birthdays.today_label') })),
    ...upcoming.map((b) => ({
      b,
      key: occurrenceKey(b),
      label:
        b.daysLeft === 1
          ? t('birthdays.tomorrow')
          : t('birthdays.in_days', { days: b.daysLeft }),
    })),
  ].filter((n) => !read[n.key]);

  const count = notifs.length;

  const openNotif = (key: string) => {
    markRead(key); // mark as read -> disappears from the list
    setOpen(false);
    navigate('/birthdays');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-full border border-border p-2 transition-colors hover:bg-accent">
          <Bell className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="brand-gradient absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border p-3 font-semibold">
          {t('birthdays.notif_title')}
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {count === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('birthdays.none_unread')}
            </div>
          ) : (
            notifs.map((n) => (
              <button
                key={n.key}
                onClick={() => openNotif(n.key)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Cake className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {n.b.firstName} {n.b.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {n.b.department ?? '-'}
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">{n.label}</span>
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => {
            setOpen(false);
            navigate('/birthdays');
          }}
          className="w-full border-t border-border p-2.5 text-center text-sm font-medium text-primary hover:bg-accent"
        >
          {t('birthdays.view_all')}
        </button>
      </PopoverContent>
    </Popover>
  );
}
