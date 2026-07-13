import { CheckCircle2, Clock, LogOut, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAttendance, useEmployees } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTime } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { StatusBadge } from './_shared';

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Vientiane' });
}

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const day = todayStr();

  const employees = useEmployees({ page: 1, limit: 1 });
  const today = useAttendance({ dateFrom: day, dateTo: day, limit: 100 });

  const items = today.data?.items ?? [];
  const present = items.filter((a) => a.status === 'present').length;
  const late = items.filter((a) => a.status === 'late').length;
  const checkedOut = items.filter((a) => a.checkOutTime).length;

  const stats = [
    { label: t('dashboard.total_employees'), value: employees.data?.total ?? 0, icon: Users, color: 'text-primary bg-primary/10' },
    { label: t('dashboard.present_today'), value: present, icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-500/20' },
    { label: t('dashboard.late_today'), value: late, icon: Clock, color: 'text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20' },
    { label: t('dashboard.checked_out'), value: checkedOut, icon: LogOut, color: 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/20' },
  ];

  return (
    <div>
      <PageHeader title={`${t('dashboard.welcome')}, ${user?.username || user?.email}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
            <span className="font-semibold">{t('dashboard.today_workers')}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {day.split('-').reverse().join('/')}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('attendance.employee')}</TableHead>
                <TableHead>{t('attendance.check_in')}</TableHead>
                <TableHead>{t('attendance.check_out')}</TableHead>
                <TableHead>{t('attendance.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.employee
                      ? `${a.employee.firstName} ${a.employee.lastName}`
                      : a.employeeId.slice(0, 8)}
                  </TableCell>
                  <TableCell>{formatTime(a.checkInTime)}</TableCell>
                  <TableCell>{formatTime(a.checkOutTime)}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {employees.isError && (
        <Badge variant="destructive" className="mt-4">Failed to load</Badge>
      )}
    </div>
  );
}
