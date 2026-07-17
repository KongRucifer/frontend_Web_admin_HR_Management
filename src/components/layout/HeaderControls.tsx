import { LogOut, Moon, PanelLeft, PanelTop, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LANGS, setLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { useUIStore } from '@/store/ui.store';
import { NotificationBell } from './NotificationBell';

/** Right-hand controls shared by the header nav and the sidebar-mode top bar. */
export function HeaderControls({ showLogout = true }: { showLogout?: boolean }) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navMode = useUIStore((s) => s.navMode);
  const toggleNavMode = useUIStore((s) => s.toggleNavMode);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language switch */}
      <div className="flex items-center rounded-full border border-border p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={cn(
              'w-16 rounded-full py-1 text-center text-xs font-medium transition-colors',
              i18n.language === l.code
                ? 'brand-gradient text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Dark / light toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        title={t('layout.theme')}
        className="rounded-full"
      >
        {theme === 'dark' ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )}
      </Button>

      {/* Real-time notifications (approvals, contract & birthday reminders, ...) */}
      <NotificationBell />

      {/* Layout toggle: header <-> sidebar */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleNavMode}
        title={t('layout.toggle')}
        className="rounded-full"
      >
        {navMode === 'header' ? (
          <PanelLeft className="h-[18px] w-[18px]" />
        ) : (
          <PanelTop className="h-[18px] w-[18px]" />
        )}
      </Button>

      {/* Profile — opens Profile Settings */}
      <button
        type="button"
        onClick={() => navigate('/profile-settings')}
        title={t('profile_settings.title')}
        className="flex items-center gap-2 rounded-full p-0.5 pr-0.5 transition-colors hover:bg-accent sm:pl-2"
      >
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium leading-tight">
            {user?.username || user?.email}
          </div>
          <div className="text-xs text-muted-foreground">
            {t(`roles.${user?.role}`)}
          </div>
        </div>
        <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white">
          {(user?.username || user?.email)?.[0]?.toUpperCase()}
        </div>
      </button>

      {showLogout && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title={t('nav.logout')}
          className="rounded-full"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </Button>
      )}
    </div>
  );
}
