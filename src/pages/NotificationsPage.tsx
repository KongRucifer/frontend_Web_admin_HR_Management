import { Bell, Cake, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useMarkAllNotifRead,
  useMarkNotifRead,
  useNotifications,
} from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-menu';
import { formatDateTime } from '@/lib/utils';
import { toast } from '@/store/toast.store';
import { Pagination } from './_shared';

type ReadFilter = 'all' | 'unread' | 'read';

export function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useNotifications({
    page,
    limit: 12,
    isRead: readFilter === 'all' ? undefined : readFilter === 'read',
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const markRead = useMarkNotifRead();
  const markAll = useMarkAllNotifRead();

  const onMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      toast.success(t('notifications.all_read'));
    } catch (e: any) {
      toast.error(e?.apiMessage || t('common.error'));
    }
  };

  return (
    <div>
      <PageHeader title={t('notifications.title')}>
        <Button variant="outline" onClick={onMarkAll} disabled={markAll.isPending}>
          <CheckCheck className="h-4 w-4" /> {t('notifications.mark_all_read')}
        </Button>
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t('common.status')}</Label>
            <SelectField
              value={readFilter}
              onValueChange={(v) => {
                setReadFilter(v as ReadFilter);
                setPage(1);
              }}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'unread', label: t('notifications.unread') },
                { value: 'read', label: t('notifications.read') },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('attendance.from')}</Label>
            <DatePicker
              value={dateFrom}
              onChange={(v) => { setDateFrom(v); setPage(1); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('attendance.to')}</Label>
            <DatePicker
              value={dateTo}
              onChange={(v) => { setDateTo(v); setPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="py-10 text-center text-muted-foreground">
                {t('common.loading')}
              </div>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                {t('common.no_data')}
              </div>
            )}
            {data?.items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                  if (n.type.startsWith('birthday')) navigate('/birthdays');
                }}
                className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div
                  className={
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' +
                    (n.isRead
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary')
                  }
                >
                  {n.type.startsWith('birthday') ? (
                    <Cake className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="mt-1 text-xs text-muted-foreground/70">
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 pb-2 pt-2">
            <Pagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              onPage={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
