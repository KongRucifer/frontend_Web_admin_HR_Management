import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useActivateSchedule,
  useDeleteSchedule,
  useSaveSchedule,
  useSchedules,
} from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WorkSchedule } from '@/types';
import { ActorCell, confirmDelete, Loading } from './_shared';

const empty = { name: '', startTime: '08:00', endTime: '17:00', lateAfterMinutes: 15 };

export function SchedulesPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useSchedules();
  const save = useSaveSchedule();
  const del = useDeleteSchedule();
  const activate = useActivateSchedule();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkSchedule | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (s: WorkSchedule) => {
    setEditing(s);
    setForm({
      name: s.name,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
      lateAfterMinutes: s.lateAfterMinutes,
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({ id: editing?.id, ...form });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title={t('schedules.title')}>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> {t('schedules.new')}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('schedules.name')}</TableHead>
                <TableHead>{t('schedules.start')}</TableHead>
                <TableHead>{t('schedules.end')}</TableHead>
                <TableHead>{t('schedules.late_after')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.created_by')}</TableHead>
                <TableHead>{t('common.updated_by')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loading />
                  </TableCell>
                </TableRow>
              )}
              {data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.startTime.slice(0, 5)}</TableCell>
                  <TableCell>{s.endTime.slice(0, 5)}</TableCell>
                  <TableCell>{s.lateAfterMinutes} min</TableCell>
                  <TableCell>
                    {s.isActive ? (
                      <Badge variant="success">{t('schedules.active')}</Badge>
                    ) : (
                      <button
                        onClick={() => activate.mutate(s.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {t('schedules.set_active')}
                      </button>
                    )}
                  </TableCell>
                  <TableCell><ActorCell actor={s.createdBy} /></TableCell>
                  <TableCell><ActorCell actor={s.updatedBy} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(t, del.mutateAsync, s.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('common.edit') : t('schedules.new')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('schedules.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('schedules.start')}</Label>
                <TimePicker value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('schedules.end')}</Label>
                <TimePicker value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('schedules.late_after')}</Label>
              <Input
                type="number"
                min={0}
                value={form.lateAfterMinutes}
                onChange={(e) => setForm({ ...form, lateAfterMinutes: Number(e.target.value) })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
