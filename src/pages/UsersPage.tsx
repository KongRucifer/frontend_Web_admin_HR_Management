import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteUser, useSaveUser, useUsers } from '@/api/hooks';
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
import { useEmailStatus } from '@/lib/use-email-status';
import { useUsernameStatus } from '@/lib/use-username-status';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { Role } from '@/types';
import { ActorCell } from './_shared';

const empty = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'employee' as Role,
};

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useUsers();
  const save = useSaveUser();
  const del = useDeleteUser();

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

  return (
    <div>
      <PageHeader title={t('users.title')}>
        <Button onClick={() => { setForm(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t('users.new')}
        </Button>
      </PageHeader>

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
              {data?.map((u) => (
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
                    {u.role !== 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(u.id, u.email)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
