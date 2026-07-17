import { CalendarDays, Home, Search, Trash2, Users2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAllRemoteWork,
  useGrantRemoteWork,
  useInfiniteEmployees,
  useRemoteWork,
  useRevokeRemoteWork,
  type RemoteWorkItem,
} from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/lib/use-debounce';
import { formatDate } from '@/lib/utils';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import { OfficeLocationsPage } from './OfficeLocationsPage';
import { Pagination } from './_shared';
import { SchedulesPage } from './SchedulesPage';

/** Today as YYYY-MM-DD in the admin's local timezone (Vientiane). */
function todayStr(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** True when a scroll container is within `threshold`px of the bottom. */
function nearBottom(e: React.UIEvent<HTMLDivElement>, threshold = 48): boolean {
  const el = e.currentTarget;
  return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
}

type RevokeFn = (employeeId: string, name: string, date: string) => void;

/**
 * Settings hub. Groups the Work Schedules and Office Location management (each
 * previously its own menu item) into one place, and adds the work-from-home
 * section below them: pick employees + a date and grant them a GPS-bypass day.
 */
export function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      <SchedulesPage />
      <OfficeLocationsPage />
      <section>
        <PageHeader title={t('settings.wfh.title')} />
        <RemoteWorkPanel />
      </section>
    </div>
  );
}

/**
 * A fixed-height, scrollable list of granted employees that renders in batches
 * (lazy render — 5 rows at a time as you scroll) so a long list never floods the
 * DOM. Used for both the selected-date column and each scheduled-day card.
 */
function GrantedList({
  items,
  date,
  onRevoke,
  emptyText,
  batch = 5,
}: {
  items: RemoteWorkItem[];
  date: string;
  onRevoke: RevokeFn;
  emptyText: string;
  batch?: number;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(batch);

  // Reset the window whenever the underlying list changes (grant / revoke).
  useEffect(() => setVisible(batch), [items, batch]);

  const shown = items.slice(0, visible);
  return (
    <div
      className="max-h-[248px] overflow-y-auto p-1.5"
      onScroll={(e) => {
        if (nearBottom(e) && visible < items.length) {
          setVisible((v) => Math.min(v + batch, items.length));
        }
      }}
    >
      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        shown.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {g.employee.firstName} {g.employee.lastName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {g.employee.employeeCode}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title={t('settings.wfh.revoke')}
              onClick={() =>
                onRevoke(
                  g.employeeId,
                  `${g.employee.firstName} ${g.employee.lastName}`,
                  date,
                )
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

/** Grant / revoke a work-from-home (GPS-bypass) day for chosen employees. */
function RemoteWorkPanel() {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 400);

  // Employee picker: infinite scroll (lazy loads the next page near the bottom).
  const {
    data: empPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: empLoading,
  } = useInfiniteEmployees(debouncedSearch, 20);
  const employees = empPages?.pages.flatMap((p) => p.items) ?? [];

  const { data: granted } = useRemoteWork(date);
  const { data: allWfh } = useAllRemoteWork();
  const grant = useGrantRemoteWork();
  const revoke = useRevokeRemoteWork();

  const grantedItems = granted?.items ?? [];
  const scheduledDates = allWfh?.dates ?? [];
  const grantedIds = useMemo(
    () => new Set(grantedItems.map((g) => g.employeeId)),
    [grantedItems],
  );

  // Client-side pagination for the scheduled-day cards.
  const SCHED_PER_PAGE = 6;
  const [schedPage, setSchedPage] = useState(1);
  const schedTotalPages = Math.max(
    1,
    Math.ceil(scheduledDates.length / SCHED_PER_PAGE),
  );
  useEffect(() => {
    if (schedPage > schedTotalPages) setSchedPage(schedTotalPages);
  }, [schedPage, schedTotalPages]);
  const pagedDates = scheduledDates.slice(
    (schedPage - 1) * SCHED_PER_PAGE,
    schedPage * SCHED_PER_PAGE,
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected =
    employees.length > 0 && employees.every((e) => selected.has(e.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) employees.forEach((e) => next.delete(e.id));
      else employees.forEach((e) => next.add(e.id));
      return next;
    });

  const onGrant = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (
      await confirm({
        title: t('settings.wfh.confirm_title'),
        message: t('settings.wfh.confirm_msg', { count: ids.length, date }),
        confirmLabel: t('settings.wfh.grant'),
      })
    ) {
      try {
        const r: any = await grant.mutateAsync({ employeeIds: ids, date });
        toast.success(t('settings.wfh.granted', { count: r?.granted ?? ids.length }));
        setSelected(new Set());
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  const onRevoke: RevokeFn = async (employeeId, name, revokeDate) => {
    if (
      await confirm({
        title: t('settings.wfh.revoke_title'),
        message: name,
        danger: true,
        confirmLabel: t('settings.wfh.revoke'),
      })
    ) {
      try {
        await revoke.mutateAsync({ employeeId, date: revokeDate });
        toast.success(t('common.deleted'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* Date + hint */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <Label>{t('settings.wfh.date')}</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            {t('settings.wfh.hint')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* ---- Left: employee picker (infinite scroll) ---- */}
          <div className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border p-2.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder={t('settings.wfh.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <label className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                {t('settings.wfh.select_all')}
              </label>
            </div>
            {/* ~5 rows tall, then scroll; the next page loads near the bottom. */}
            <div
              className="max-h-[260px] overflow-y-auto p-1.5"
              onScroll={(e) => {
                if (nearBottom(e) && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            >
              {employees.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {empLoading ? t('common.loading') : t('common.no_data')}
                </div>
              )}
              {employees.map((e) => {
                const already = grantedIds.has(e.id);
                return (
                  <label
                    key={e.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={selected.has(e.id)}
                      onChange={() => toggle(e.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {e.firstName} {e.lastName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {e.employeeCode}
                      </div>
                    </div>
                    {already && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Home className="h-3 w-3" />
                        {t('settings.wfh.already')}
                      </span>
                    )}
                  </label>
                );
              })}
              {isFetchingNextPage && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  {t('common.loading')}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border p-2.5">
              <span className="text-xs text-muted-foreground">
                {t('settings.wfh.selected_count', { count: selected.size })}
              </span>
              <Button onClick={onGrant} disabled={selected.size === 0 || grant.isPending}>
                <Home className="h-4 w-4" />
                {grant.isPending ? t('common.saving') : t('settings.wfh.grant')}
              </Button>
            </div>
          </div>

          {/* ---- Right: currently granted for the selected date ---- */}
          <div className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border p-3 text-sm font-medium">
              <Users2 className="h-4 w-4 text-primary" />
              {t('settings.wfh.granted_on', { date })}
            </div>
            <GrantedList
              items={grantedItems}
              date={date}
              onRevoke={onRevoke}
              emptyText={t('settings.wfh.none_granted')}
            />
          </div>
        </div>
      </CardContent>

      {/* ---- Scheduled WFH days: paginated cards, each list scrollable ---- */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          {t('settings.wfh.scheduled')}
        </div>
        {scheduledDates.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t('settings.wfh.no_scheduled')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pagedDates.map((d) => (
                <div key={d.date} className="rounded-lg border border-border">
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
                    <span className="text-sm font-semibold">
                      {formatDate(d.date)}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {t('settings.wfh.people_count', { count: d.items.length })}
                    </span>
                  </div>
                  <GrantedList
                    items={d.items}
                    date={d.date}
                    onRevoke={onRevoke}
                    emptyText={t('settings.wfh.none_granted')}
                  />
                </div>
              ))}
            </div>
            {schedTotalPages > 1 && (
              <div className="pt-3">
                <Pagination
                  page={schedPage}
                  totalPages={schedTotalPages}
                  onPage={setSchedPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
