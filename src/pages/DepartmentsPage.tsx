import { Briefcase, Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteDepartment,
  useDeletePosition,
  useDepartments,
  useDepartmentSummary,
  usePositions,
  useSaveDepartment,
  useSavePosition,
} from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
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
import { SelectField } from '@/components/ui/select-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/store/toast.store';
import type { Department, Position } from '@/types';
import { confirmDelete, StatCards } from './_shared';

export function DepartmentsPage() {
  const { t } = useTranslation();
  const summary = useDepartmentSummary();

  return (
    <div>
      <PageHeader title={t('nav.departments')} />
      <StatCards
        className="mb-4 sm:grid-cols-2 lg:grid-cols-2"
        stats={[
          { label: t('departments.summary_total'), value: summary.data?.totalDepartments ?? 0, icon: Building2, color: 'text-primary bg-primary/10' },
          { label: t('positions.summary_total'), value: summary.data?.totalPositions ?? 0, icon: Briefcase, color: 'text-teal-600 bg-teal-100 dark:text-teal-300 dark:bg-teal-500/20' },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DepartmentsCard />
        <PositionsCard />
      </div>
    </div>
  );
}

// ---------------- Departments ----------------
function DepartmentsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useDepartments();
  const save = useSaveDepartment();
  const del = useDeleteDepartment();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState('');

  const openNew = () => { setEditing(null); setName(''); setOpen(true); };
  const openEdit = (d: Department) => { setEditing(d); setName(d.name); setOpen(true); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({ id: editing?.id, name });
      setOpen(false);
      toast.success(editing ? t('common.updated') : t('common.created'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-semibold">{t('departments.title')}</span>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> {t('departments.new')}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('departments.name')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={2} className="py-8 text-center text-muted-foreground">{t('common.loading')}</TableCell></TableRow>
            )}
            {data?.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(t, del.mutateAsync, d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data?.length === 0 && (
              <TableRow><TableCell colSpan={2} className="py-8 text-center text-muted-foreground">{t('common.no_data')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('departments.new')}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('departments.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------- Positions ----------------
function PositionsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = usePositions();
  const departments = useDepartments();
  const save = useSavePosition();
  const del = useDeletePosition();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState({ name: '', departmentId: '' });

  const openNew = () => { setEditing(null); setForm({ name: '', departmentId: '' }); setOpen(true); };
  const openEdit = (p: Position) => { setEditing(p); setForm({ name: p.name, departmentId: p.departmentId }); setOpen(true); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) { toast.warning(t('positions.department')); return; }
    try {
      await save.mutateAsync({ id: editing?.id, name: form.name, departmentId: form.departmentId });
      setOpen(false);
      toast.success(editing ? t('common.updated') : t('common.created'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-semibold">{t('positions.title')}</span>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> {t('positions.new')}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('positions.name')}</TableHead>
              <TableHead>{t('positions.department')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">{t('common.loading')}</TableCell></TableRow>
            )}
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.department?.name ?? '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(t, del.mutateAsync, p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data?.length === 0 && (
              <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">{t('common.no_data')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('positions.new')}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('positions.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>{t('positions.department')}</Label>
              <SelectField
                value={form.departmentId || undefined}
                onValueChange={(v) => setForm({ ...form, departmentId: v })}
                placeholder={t('positions.department')}
                options={(departments.data ?? []).map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
