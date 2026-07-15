import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendance } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-menu';
import { useDebounce } from '@/lib/use-debounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatTime } from '@/lib/utils';
import type { AttendanceStatus, RequestKind } from '@/types';
import { Pagination, RequestTypeBadge, StatusBadge } from './_shared';

/** '' = no filter. leave/emergency filter by request kind, the rest by status. */
type StatusFilter = '' | AttendanceStatus;

export function AttendancePage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');

  // Only fetch once the user stops typing (waits 400ms).
  const debouncedSearch = useDebounce(search, 400);

  // leave/emergency must go through `kind` (FK-based): a partial-day emergency
  // keeps status 'on_time', so filtering it by status would find nothing.
  const isKind = status === 'leave' || status === 'emergency';

  const { data, isLoading } = useAttendance({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: isKind ? undefined : (status || undefined),
    kind: isKind ? (status as RequestKind) : undefined,
  });

  return (
    <div>
      <PageHeader title={t('attendance.title')} />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>{t('attendance.employee')}</Label>
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('attendance.from')}</Label>
            <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('attendance.to')}</Label>
            <DatePicker value={dateTo} onChange={(v) => { setDateTo(v); setPage(1); }} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('attendance.status')}</Label>
            <SelectField
              value={status || 'all'}
              onValueChange={(v) => {
                setStatus(v === 'all' ? '' : (v as AttendanceStatus));
                setPage(1);
              }}
              placeholder={t('common.all')}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'on_time', label: t('status.on_time') },
                { value: 'late', label: t('status.late') },
                { value: 'absent', label: t('status.absent') },
                { value: 'leave', label: t('status.leave') },
                { value: 'emergency', label: t('status.emergency') },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('attendance.date')}</TableHead>
                <TableHead>{t('attendance.employee')}</TableHead>
                <TableHead>{t('attendance.check_in')}</TableHead>
                <TableHead>{t('attendance.check_out')}</TableHead>
                <TableHead>{t('attendance.hours')}</TableHead>
                <TableHead>{t('attendance.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(a.workDate)}</span>
                      <RequestTypeBadge
                        kind={a.requestKind}
                        name={a.requestTypeName}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {a.employee
                      ? `${a.employee.firstName} ${a.employee.lastName}`
                      : a.employeeId.slice(0, 8)}
                  </TableCell>
                  <TableCell>{formatTime(a.checkInTime)}</TableCell>
                  <TableCell>{formatTime(a.checkOutTime)}</TableCell>
                  <TableCell>{a.workHours ?? '-'}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-2">
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
