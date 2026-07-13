import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteEmployee,
  useDepartments,
  useEmployees,
  usePositions,
  useSaveEmployee,
} from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SelectField } from '@/components/ui/select-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { Employee } from '@/types';
import { Pagination } from './_shared';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  positionId: '',
  birthDate: '',
  status: 'active',
  username: '',
  password: '',
};

export function EmployeesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const { data, isLoading } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    departmentId: departmentId || undefined,
  });
  const departments = useDepartments();
  const positions = usePositions();
  const save = useSaveEmployee();
  const del = useDeleteEmployee();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      ...emptyForm,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email ?? '',
      phone: e.phone ?? '',
      departmentId: e.departmentId ?? '',
      positionId: e.positionId ?? '',
      birthDate: e.birthDate ?? '',
      status: e.status,
    });
    setOpen(true);
  };

  // Position + department are linked: choosing a position sets its department;
  // choosing a department clears a position that no longer belongs to it.
  const onPickPosition = (positionId: string) => {
    const p = positions.data?.find((x) => x.id === positionId);
    setForm((f) => ({
      ...f,
      positionId,
      departmentId: p ? p.departmentId : f.departmentId,
    }));
  };
  const onPickDepartment = (departmentId: string) => {
    setForm((f) => {
      const stillValid = positions.data?.some(
        (p) => p.id === f.positionId && p.departmentId === departmentId,
      );
      return { ...f, departmentId, positionId: stillValid ? f.positionId : '' };
    });
  };
  // Positions available for the currently selected department (all if none).
  const availablePositions = form.departmentId
    ? (positions.data ?? []).filter((p) => p.departmentId === form.departmentId)
    : positions.data ?? [];

  // ---- inline validation (checked live, before submit) ----
  const emailValid = /^\S+@\S+\.\S+$/.test(form.email);
  const passwordValid = form.password.length >= 8;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    // New employees always get a login account, so email + password are required.
    if (!editing) {
      if (!emailValid) {
        toast.warning(t('employees.invalid_email'));
        return;
      }
      if (!passwordValid) {
        toast.warning(t('employees.password_short'));
        return;
      }
    }

    const base: any = {
      // employeeCode + schedule are auto-assigned by the backend.
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      departmentId: form.departmentId || undefined,
      positionId: form.positionId || undefined,
      birthDate: form.birthDate || undefined,
      status: editing ? form.status : 'active',
    };
    if (!editing) {
      // Every new employee gets an account with the "employee" role.
      base.createAccount = true;
      base.username = form.username || undefined;
      base.loginEmail = form.email;
      base.password = form.password;
      base.role = 'employee';
    }
    try {
      await save.mutateAsync(editing ? { id: editing.id, body: base } : { body: base });
      setOpen(false);
      toast.success(editing ? t('common.updated') : t('common.created'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <div>
      <PageHeader title={t('employees.title')}>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> {t('employees.new')}
        </Button>
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <SelectField
            value={departmentId || 'all'}
            onValueChange={(v) => { setDepartmentId(v === 'all' ? '' : v); setPage(1); }}
            placeholder={t('common.all')}
            options={[
              { value: 'all', label: t('common.all') },
              ...(departments.data?.map((d) => ({ value: d.id, label: d.name })) ?? []),
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.code')}</TableHead>
                <TableHead>{t('employees.name')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead>{t('employees.position')}</TableHead>
                <TableHead>{t('employees.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
              {data?.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.employeeCode}</TableCell>
                  <TableCell className="font-medium">{e.firstName} {e.lastName}</TableCell>
                  <TableCell>{e.department?.name ?? '-'}</TableCell>
                  <TableCell>{e.positionRef?.name ?? e.position ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'active' ? 'success' : 'muted'}>
                      {t(`status.${e.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (
                            await confirm({
                              title: t('common.confirm_delete'),
                              message: t('employees.delete_hint'),
                              danger: true,
                            })
                          ) {
                            try {
                              await del.mutateAsync(e.id);
                              toast.success(t('common.deleted'));
                            } catch (err: any) {
                              toast.error(err?.apiMessage || t('common.error'));
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="px-4 pb-2">
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t('common.edit') : t('employees.new')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('employees.first_name')}</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>{t('employees.last_name')}</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('employees.department')}</Label>
                <Combobox
                  value={form.departmentId || undefined}
                  onValueChange={onPickDepartment}
                  placeholder={t('employees.department')}
                  options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('employees.position')}</Label>
                <Combobox
                  value={form.positionId || undefined}
                  onValueChange={onPickPosition}
                  placeholder={t('positions.select')}
                  options={availablePositions.map((p) => ({
                    value: p.id,
                    label: `${p.name}${!form.departmentId && p.department ? ` · ${p.department.name}` : ''}`,
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('employees.phone')}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('employees.birth_date')}</Label>
                <DatePicker value={form.birthDate} onChange={(v) => setForm({ ...form, birthDate: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  {t('employees.email')}
                  {!editing && <span className="text-destructive"> *</span>}
                </Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {!editing && form.email.length > 0 && !emailValid && (
                  <p className="text-xs text-destructive">{t('employees.invalid_email')}</p>
                )}
              </div>
              {editing && (
                <div className="space-y-1.5">
                  <Label>{t('employees.status')}</Label>
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">{t('status.active')}</option>
                    <option value="inactive">{t('status.inactive')}</option>
                  </Select>
                </div>
              )}
            </div>

            {/* Login account — always created for new employees */}
            {!editing && (
              <div className="rounded-md border border-border p-3">
                <div className="mb-3 text-sm font-medium">
                  {t('employees.account_section')}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{t('employees.account_username')}</Label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t('employees.account_username')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('employees.account_password')} <span className="text-destructive">*</span></Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    {form.password.length > 0 && !passwordValid && (
                      <p className="text-xs text-destructive">{t('employees.password_short')}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('employees.account_hint')}
                </p>
              </div>
            )}

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
