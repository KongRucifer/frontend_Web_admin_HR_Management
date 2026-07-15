import { KeyRound, Mail, MailCheck, Pencil, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useChangePassword,
  useConfirmEmailOtp,
  useConfirmPasswordOtp,
  useRequestEmailOtp,
  useRequestPasswordOtp,
  useUpdateUsername,
} from '@/api/account';
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
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';

type Modal = null | 'username' | 'password' | 'password-otp' | 'email';

export function ProfileSettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);

  const initial = (user?.username || user?.email || '?')[0]?.toUpperCase();

  return (
    <div>
      <PageHeader title={t('profile_settings.title')} />

      {/* ---- Identity card ---- */}
      <Card className="mb-4">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          {/* Avatar (initials) */}
          <div className="brand-gradient flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md">
            {initial}
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            {/* Username + pen */}
            <div>
              <div className="text-xs text-muted-foreground">
                {t('users.username')}
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                <span className="truncate text-lg font-semibold">
                  {user?.username}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title={t('profile_settings.edit_username')}
                  onClick={() => setModal('username')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="text-xs text-muted-foreground">
                {t('users.email')}
              </div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-sm">{user?.email}</span>
              </div>
            </div>

            <Badge>{t(`roles.${user?.role}`)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <Card>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-3">
          <Button variant="outline" onClick={() => setModal('password')}>
            <KeyRound className="h-4 w-4" /> {t('profile_settings.change_password')}
          </Button>
          <Button variant="outline" onClick={() => setModal('password-otp')}>
            <ShieldCheck className="h-4 w-4" /> {t('profile_settings.create_password')}
          </Button>
          <Button variant="outline" onClick={() => setModal('email')}>
            <MailCheck className="h-4 w-4" /> {t('profile_settings.update_email')}
          </Button>
        </CardContent>
      </Card>

      {modal === 'username' && (
        <UsernameModal
          current={user?.username ?? ''}
          onDone={async () => {
            await fetchMe();
            close();
          }}
          onClose={close}
        />
      )}
      {modal === 'password' && <ChangePasswordModal onClose={close} />}
      {modal === 'password-otp' && (
        <CreatePasswordModal email={user?.email ?? ''} onClose={close} />
      )}
      {modal === 'email' && (
        <UpdateEmailModal
          onDone={async () => {
            await fetchMe();
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

/* ------------------------- Username ------------------------- */
function UsernameModal({
  current,
  onDone,
  onClose,
}: {
  current: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(current);
  const save = useUpdateUsername();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync(username.trim());
      toast.success(t('common.updated'));
      onDone();
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Shell title={t('profile_settings.edit_username')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('users.username')}</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoFocus
          />
        </div>
        <Footer onClose={onClose} pending={save.isPending} />
      </form>
    </Shell>
  );
}

/* ------------ Change password (knows current one) ------------ */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const change = useChangePassword();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.warning(t('employees.password_short'));
    if (next !== confirm) return toast.warning(t('users.password_mismatch'));
    try {
      await change.mutateAsync({ currentPassword: current, newPassword: next });
      toast.success(t('profile_settings.password_changed'));
      onClose();
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Shell title={t('profile_settings.change_password')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('users.current_password')}</Label>
          <PasswordInput
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.new_password')}</Label>
          <PasswordInput
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.confirm_password')}</Label>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {confirm.length > 0 && next !== confirm && (
            <p className="text-xs text-destructive">{t('users.password_mismatch')}</p>
          )}
        </div>
        <Footer onClose={onClose} pending={change.isPending} />
      </form>
    </Shell>
  );
}

/* --------- Create new password (OTP — forgot current) --------- */
function CreatePasswordModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const request = useRequestPasswordOtp();
  const confirmOtp = useConfirmPasswordOtp();

  const send = async () => {
    try {
      await request.mutateAsync();
      setSent(true);
      toast.success(t('profile_settings.otp_sent'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.warning(t('employees.password_short'));
    if (next !== confirm) return toast.warning(t('users.password_mismatch'));
    try {
      await confirmOtp.mutateAsync({ code: code.trim(), newPassword: next });
      toast.success(t('profile_settings.password_changed'));
      onClose();
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Shell title={t('profile_settings.create_password')} onClose={onClose}>
      {!sent ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('profile_settings.otp_will_be_sent')}
          </p>
          <div className="rounded-md border border-border bg-primary/5 px-3 py-2 text-sm font-medium">
            {email}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={send} disabled={request.isPending}>
              {request.isPending
                ? t('profile_settings.sending')
                : t('profile_settings.send_otp')}
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('profile_settings.otp_sent_to')} <b>{email}</b>
          </p>
          <div className="space-y-1.5">
            <Label>{t('profile_settings.otp_code')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
              className="text-center text-lg font-bold tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('users.new_password')}</Label>
            <PasswordInput
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('users.confirm_password')}</Label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={send}>
              {t('profile_settings.resend_otp')}
            </Button>
            <Button type="submit" disabled={confirmOtp.isPending}>
              {confirmOtp.isPending ? t('common.saving') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Shell>
  );
}

/* ------------- Update email (OTP to the NEW address) ------------- */
function UpdateEmailModal({
  onDone,
  onClose,
}: {
  onDone: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [newEmail, setNewEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const request = useRequestEmailOtp();
  const confirmOtp = useConfirmEmailOtp();

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request.mutateAsync(newEmail.trim());
      setSent(true);
      toast.success(t('profile_settings.otp_sent'));
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmOtp.mutateAsync(code.trim());
      toast.success(t('profile_settings.email_updated'));
      onDone();
    } catch (err: any) {
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <Shell title={t('profile_settings.update_email')} onClose={onClose}>
      {!sent ? (
        <form onSubmit={send} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('profile_settings.new_email')}</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('profile_settings.email_otp_hint')}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={request.isPending}>
              {request.isPending
                ? t('profile_settings.sending')
                : t('profile_settings.send_otp')}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('profile_settings.otp_sent_to')} <b>{newEmail}</b>
          </p>
          <div className="space-y-1.5">
            <Label>{t('profile_settings.otp_code')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
              className="text-center text-lg font-bold tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSent(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={confirmOtp.isPending}>
              {confirmOtp.isPending ? t('common.saving') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Shell>
  );
}

/* ------------------------- shared bits ------------------------- */
function Shell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function Footer({ onClose, pending }: { onClose: () => void; pending: boolean }) {
  const { t } = useTranslation();
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onClose}>
        {t('common.cancel')}
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? t('common.saving') : t('common.save')}
      </Button>
    </DialogFooter>
  );
}
