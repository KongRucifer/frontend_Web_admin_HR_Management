import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { BrandWordmark } from '@/components/BrandWordmark';
import { LANGS, setLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      // The backend returns a message key (e.g. "common.errors.admin_only");
      // translate it, falling back to the raw text / a generic message.
      const key = err?.apiMessage;
      setError(key ? t(key, { defaultValue: key }) : t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/40 p-4">
      <div className="absolute right-4 top-4 flex items-center rounded-md border border-border bg-card p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              i18n.language === l.code
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Blue gradient frame: a thin peek at the top + upper sides, fading out
            around the vertical center (semi-transparent). */}
        <div
          aria-hidden
          className="brand-gradient pointer-events-none absolute -left-2.5 -right-2.5 -top-2.5 bottom-1/2 rounded-[2rem] opacity-80 shadow-lg"
        />

        {/* White form card on top. */}
        <div className="relative z-10 rounded-[2rem] border border-white/50 bg-card p-8 shadow-2xl dark:border-white/10">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo className="h-16 w-auto" />
            {/* Wordmark under the logo. */}
            <BrandWordmark className="mb-4 mt-2" />
            <h1 className="text-xl font-semibold">{t('login.title')}</h1>
            {/* <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p> */}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('login.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('login.password')}</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
