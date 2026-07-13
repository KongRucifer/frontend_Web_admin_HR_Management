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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';

const empty = { email: '', username: '', password: '', confirmPassword: '' };

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useUsers();
  const save = useSaveUser();
  const del = useDeleteUser();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

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
    try {
      // New users created here are admins (role auto-assigned).
      await save.mutateAsync({
        body: {
          email: form.email,
          username: form.username || undefined,
          password: form.password,
          role: 'admin',
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
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.username')}</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.password')}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('users.confirm_password')}</Label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <p className="text-xs text-destructive">{t('users.password_mismatch')}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('users.create_hint')}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
