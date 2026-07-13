import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendance } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatTime } from '@/lib/utils';
import { Pagination, StatusBadge } from './_shared';

export function AttendancePage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useAttendance({
    page,
    limit: 20,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status || undefined,
  });

  return (
    <div>
      <PageHeader title={t('attendance.title')} />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
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
              onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}
              placeholder={t('common.all')}
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'present', label: t('status.present') },
                { value: 'late', label: t('status.late') },
                { value: 'absent', label: t('status.absent') },
                { value: 'leave', label: t('status.leave') },
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
                  <TableCell>{formatDate(a.workDate)}</TableCell>
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
