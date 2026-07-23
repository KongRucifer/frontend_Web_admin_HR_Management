import { Plus, RotateCcw, Search, Trash2, UserCheck, UserMinus, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteUser,
  useHardDeleteUser,
  useRestoreUser,
  useSaveUser,
  useUsers,
  useUserSummary,
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
import { PasswordInput } from '@/components/ui/password-input';
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
import { EmailHint } from '@/components/ui/email-hint';
import { UsernameHint } from '@/components/ui/username-hint';
import { formatDateTime } from '@/lib/utils';
import { useDebounce } from '@/lib/use-debounce';
import { useEmailStatus } from '@/lib/use-email-status';
import { useUsernameStatus } from '@/lib/use-username-status';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { Role } from '@/types';
import { ActorCell, Pagination, StatCards } from './_shared';

const empty = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'employee' as Role,
};

export function UsersPage() {
  const { t } = useTranslation();
  // Active list vs the soft-deleted bin, plus a username/email search.
  const [view, setView] = useState<'active' | 'deleted'>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading } = useUsers({
    deleted: view === 'deleted',
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });
  const summary = useUserSummary();
  const save = useSaveUser();
  const del = useDeleteUser();
  const restore = useRestoreUser();
  const hardDel = useHardDeleteUser();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const usernameStatus = useUsernameStatus(form.username);
  const emailStatus = useEmailStatus(form.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.warning(t('employees.password_short'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.warning(t('users.password_mismatch'));
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
    if (emailStatus === 'invalid') {
      toast.warning(t('employees.invalid_email'));
      return;
    }
    try {
      // Role is chosen in the form (admin or employee), not auto-assigned.
      await save.mutateAsync({
        body: {
          email: form.email,
          username: form.username, // login identifier — required
          password: form.password,
          role: form.role,
        },
      });
      setOpen(false);
      setForm(empty);
      toast.success(t('common.created'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  const onDelete = async (id: string, email: string) => {
    if (
      await confirm({
        title: t('common.confirm_delete'),
        message: `${email} — ${t('users.delete_hint')}`,
        danger: true,
      })
    ) {
      try {
        await del.mutateAsync(id);
        toast.success(t('common.deleted'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  const onRestore = async (id: string, email: string) => {
    if (
      await confirm({
        title: t('users.restore'),
        message: `${email} — ${t('users.restore_hint')}`,
        confirmLabel: t('users.restore'),
      })
    ) {
      try {
        await restore.mutateAsync(id);
        toast.success(t('users.restored'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  const onHardDelete = async (id: string, email: string) => {
    if (
      await confirm({
        title: t('users.hard_delete'),
        message: `${email} — ${t('users.hard_delete_hint')}`,
        danger: true,
      })
    ) {
      try {
        await hardDel.mutateAsync(id);
        toast.success(t('common.deleted'));
      } catch (err: any) {
        toast.error(err?.apiMessage || t('common.error'));
      }
    }
  };

  const deletedView = view === 'deleted';

  return (
    <div>
      <PageHeader title={t('users.title')}>
        <Button onClick={() => { setForm(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t('users.new')}
        </Button>
      </PageHeader>

      <StatCards
        className="mb-4"
        stats={[
          { label: t('users.summary_total'), value: summary.data?.total ?? 0, icon: Users, color: 'text-primary bg-primary/10' },
          { label: t('users.summary_active'), value: summary.data?.active ?? 0, icon: UserCheck, color: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-500/20' },
          { label: t('users.summary_inactive'), value: summary.data?.inactive ?? 0, icon: UserMinus, color: 'text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20' },
          { label: t('users.summary_deleted'), value: summary.data?.deleted ?? 0, icon: Trash2, color: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-500/20' },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('common.search')}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder={t('users.search_placeholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('common.show')}</Label>
            <SelectField
              value={view}
              onValueChange={(v) => { setView(v as 'active' | 'deleted'); setPage(1); }}
              options={[
                { value: 'active', label: t('common.active_items') },
                { value: 'deleted', label: t('common.deleted_items') },
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
                <TableHead>{t('users.email')}</TableHead>
                <TableHead>{t('users.username')}</TableHead>
                <TableHead>{t('users.role')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('users.last_login')}</TableHead>
                <TableHead>{t('common.created_by')}</TableHead>
                <TableHead>{t('common.updated_by')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.username ?? '-'}</TableCell>
                  <TableCell><Badge>{t(`roles.${u.role}`)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'success' : 'muted'}>
                      {u.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(u.lastLogin)}</TableCell>
                  <TableCell><ActorCell actor={u.createdBy} /></TableCell>
                  <TableCell><ActorCell actor={u.updatedBy} /></TableCell>
                  <TableCell className="text-right">
                    {/* Admin accounts cannot be deleted here. */}
                    {u.role !== 'admin' && !deletedView && (
                      <Button variant="ghost" size="icon" title={t('common.delete')} onClick={() => onDelete(u.id, u.email)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    {u.role !== 'admin' && deletedView && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title={t('users.restore')} onClick={() => onRestore(u.id, u.email)}>
                          <RotateCcw className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('users.hard_delete')} onClick={() => onHardDelete(u.id, u.email)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="px-4 pb-2 pt-2">
            <Pagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              onPage={setPage}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.new')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('users.email')}</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
              <EmailHint status={emailStatus} />
            </div>
            <div className="space-y-1.5">
              {/* Username is the login identifier — required. */}
              <Label>{t('users.username')}</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
              />
              <UsernameHint status={usernameStatus} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.role')}</Label>
              <SelectField
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
                options={[
                  { value: 'employee', label: t('roles.employee') },
                  { value: 'admin', label: t('roles.admin') },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.password')}</Label>
              <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.confirm_password')}</Label>
              <PasswordInput value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <p className="text-xs text-destructive">{t('users.password_mismatch')}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('users.create_hint')}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={save.isPending || usernameStatus === 'taken' || emailStatus === 'taken' || emailStatus === 'invalid'}>{save.isPending ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
