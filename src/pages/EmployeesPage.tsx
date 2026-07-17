import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteEmployee,
  useDepartments,
  useEmployees,
  useHardDeleteEmployee,
  usePositions,
  useRestoreEmployee,
  useSaveEmployee,
  useUsers,
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
import { PasswordInput } from '@/components/ui/password-input';
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
import { EmailHint } from '@/components/ui/email-hint';
import { UsernameHint } from '@/components/ui/username-hint';
import { cn, formatDate } from '@/lib/utils';
import { useDebounce } from '@/lib/use-debounce';
import { useEmailStatus } from '@/lib/use-email-status';
import { useUsernameStatus } from '@/lib/use-username-status';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { Employee } from '@/types';
import { ActorCell, Pagination } from './_shared';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  positionId: '',
  birthDate: '',
  contractEndDate: '',
  status: 'active',
  username: '',
  password: '',
  existingUserId: '',
};

export function EmployeesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  // Active list vs the soft-deleted bin.
  const [view, setView] = useState<'active' | 'deleted'>('active');

  // Only fetch once the user stops typing (waits 400ms).
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useEmployees({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    deleted: view === 'deleted' ? 'true' : undefined,
  });
  const departments = useDepartments();
  const positions = usePositions();
  // Enough to cover the linkable-account picker (the list is paginated now).
  const users = useUsers({ limit: 100 });
  const save = useSaveEmployee();
  const del = useDeleteEmployee();
  const restore = useRestoreEmployee();
  const hardDel = useHardDeleteEmployee();
  const deletedView = view === 'deleted';

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  // For a new employee, either create a fresh login account or link an existing one.
  const [accountMode, setAccountMode] = useState<'new' | 'existing'>('new');

  // Existing accounts that can be linked: employee-role accounts not yet
  // attached to any employee.
  const linkableUsers = (users.data?.items ?? []).filter(
    (u) => !u.employeeId && u.role === 'employee',
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setAccountMode('new');
    setOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      ...emptyForm,
      firstName: e.firstName,
      lastName: e.lastName,
      // Email belongs to the login account — not editable here (manage via /users).
      phone: e.phone ?? '',
      departmentId: e.departmentId ?? '',
      positionId: e.positionId ?? '',
      // The API returns '1998-05-20T00:00:00.000Z'; the form (and the DatePicker)
      // work in 'YYYY-MM-DD', which is also what gets POSTed back on save.
      birthDate: e.birthDate?.slice(0, 10) ?? '',
      contractEndDate: e.contractEndDate?.slice(0, 10) ?? '',
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
  const creatingNewAccount = !editing && accountMode === 'new';
  // Only evaluate username/email availability when creating a fresh account.
  const usernameStatus = useUsernameStatus(
    creatingNewAccount ? form.username : '',
  );
  const emailStatus = useEmailStatus(creatingNewAccount ? form.email : '');

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing) {
      if (accountMode === 'new') {
        // A fresh login account needs a valid email + password.
        if (!emailValid) {
          toast.warning(t('employees.invalid_email'));
          return;
        }
        if (!passwordValid) {
          toast.warning(t('employees.password_short'));
          return;
        }
        if (usernameStatus === 'taken') {
          toast.warning(t('users.username_taken'));
          return;
        }
        if (emailStatus === 'taken') {
          toast.warning(t('users.email_taken'));
          return;
        }
      } else if (!form.existingUserId) {
        toast.warning(t('employees.account_select_existing'));
        return;
      }
    }

    const base: any = {
      // employeeCode + schedule are auto-assigned by the backend.
      // NOTE: no email here — it belongs to the login account (see below).
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      departmentId: form.departmentId || undefined,
      positionId: form.positionId || undefined,
      birthDate: form.birthDate || undefined,
      contractEndDate: form.contractEndDate || undefined,
      status: editing ? form.status : 'active',
    };
    if (!editing) {
      base.createAccount = true;
      if (accountMode === 'existing') {
        // Attach the chosen existing account to this new employee.
        base.existingUserId = form.existingUserId;
      } else {
        // Provision a brand-new account with the "employee" role.
        base.email = form.email; // the account's email
        base.username = form.username || undefined;
        base.password = form.password;
        base.role = 'employee';
      }
    }
    try {
      await save.mutateAsync(editing ? { id: editing.id, body: base } : { body: base });
      setOpen(false);
      toast.success(editing ? t('common.updated') : t('common.created'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  const onDelete = async (e: Employee) => {
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
  };

  const onRestore = async (e: Employee) => {
    if (
      await confirm({
        title: t('employees.restore'),
        message: `${e.firstName} ${e.lastName} — ${t('employees.restore_hint')}`,
      })
    ) {
      try {
        await restore.mutateAsync(e.id);
        toast.success(t('employees.restored'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  const onHardDelete = async (e: Employee) => {
    if (
      await confirm({
        title: t('employees.hard_delete'),
        message: `${e.firstName} ${e.lastName} — ${t('employees.hard_delete_hint')}`,
        danger: true,
      })
    ) {
      try {
        await hardDel.mutateAsync(e.id);
        toast.success(t('common.deleted'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
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
            placeholder={t('employees.search_placeholder')}
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
          <SelectField
            value={view}
            onValueChange={(v) => { setView(v as 'active' | 'deleted'); setPage(1); }}
            options={[
              { value: 'active', label: t('common.active_items') },
              { value: 'deleted', label: t('common.deleted_items') },
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
                <TableHead>{t('employees.username')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead>{t('employees.position')}</TableHead>
                <TableHead>{t('employees.birth_date')}</TableHead>
                <TableHead>{t('employees.contract_end')}</TableHead>
                <TableHead>{t('employees.status')}</TableHead>
                <TableHead>{t('common.created_by')}</TableHead>
                <TableHead>{t('common.updated_by')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.employeeCode}</TableCell>
                  <TableCell className="font-medium">{e.firstName} {e.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{e.account?.username ?? '-'}</TableCell>
                  <TableCell>{e.department?.name ?? '-'}</TableCell>
                  <TableCell>{e.positionRef?.name ?? '-'}</TableCell>
                  <TableCell>{formatDate(e.birthDate)}</TableCell>
                  <TableCell>{formatDate(e.contractEndDate)}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'active' ? 'success' : 'muted'}>
                      {t(`status.${e.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell><ActorCell actor={e.createdBy} /></TableCell>
                  <TableCell><ActorCell actor={e.updatedBy} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!deletedView ? (
                        <>
                          <Button variant="ghost" size="icon" title={t('common.edit')} onClick={() => openEdit(e)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title={t('common.delete')} onClick={() => onDelete(e)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" title={t('employees.restore')} onClick={() => onRestore(e)}>
                            <RotateCcw className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" title={t('employees.hard_delete')} onClick={() => onHardDelete(e)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
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
                <Label>{t('employees.contract_end')}</Label>
                <DatePicker
                  value={form.contractEndDate}
                  onChange={(v) => setForm({ ...form, contractEndDate: v })}
                />
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

            {/* Login account — new employees get one, either fresh or linked */}
            {!editing && (
              <div className="rounded-md border border-border p-3">
                <div className="mb-3 text-sm font-medium">
                  {t('employees.account_section')}
                </div>

                {/* Choose: create a new account, or link an existing one. */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {(['new', 'existing'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAccountMode(mode)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm transition-colors',
                        accountMode === mode
                          ? 'border-primary bg-primary/5 font-medium text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {mode === 'new'
                        ? t('employees.account_create_new')
                        : t('employees.account_use_existing')}
                    </button>
                  ))}
                </div>

                {accountMode === 'new' ? (
                  <>
                    {/* Email belongs to the login account (used for notifications
                        and the password-reset OTP), so it lives in this section. */}
                    <div className="mb-3 space-y-1.5">
                      <Label>
                        {t('employees.email')}
                        <span className="text-destructive"> *</span>
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      <EmailHint status={emailStatus} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>{t('employees.account_username')}</Label>
                        <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t('employees.account_username')} />
                        <UsernameHint status={usernameStatus} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('employees.account_password')} <span className="text-destructive">*</span></Label>
                        <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        {form.password.length > 0 && !passwordValid && (
                          <p className="text-xs text-destructive">{t('employees.password_short')}</p>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('employees.account_hint')}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label>{t('employees.account_select_existing')}</Label>
                    <Combobox
                      value={form.existingUserId || undefined}
                      onValueChange={(v) => setForm({ ...form, existingUserId: v })}
                      placeholder={t('employees.account_select_existing')}
                      options={linkableUsers.map((u) => ({
                        value: u.id,
                        label: u.username ? `${u.username} · ${u.email}` : u.email,
                      }))}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {linkableUsers.length === 0
                        ? t('employees.no_linkable')
                        : t('employees.account_existing_hint')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  save.isPending ||
                  usernameStatus === 'taken' ||
                  (creatingNewAccount && emailStatus === 'taken')
                }
              >
                {save.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
