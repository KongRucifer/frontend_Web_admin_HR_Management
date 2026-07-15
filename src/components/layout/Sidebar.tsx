import { LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Logo } from '@/components/Logo';
import { navItems } from './nav-items';

export function Sidebar({
  open,
  onClose,
  mobileOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  /** When true, the sidebar only appears as a mobile drawer (never docked). */
  mobileOnly?: boolean;
}) {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed z-40 flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
          !mobileOnly && 'lg:static lg:translate-x-0',
          mobileOnly && 'lg:hidden',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-auto" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{t('app.title')}</div>
              <div className="text-[11px] opacity-70">{t('app.subtitle')}</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out active:scale-95',
                  isActive
                    ? 'brand-gradient text-white shadow-sm'
                    : 'text-sidebar-foreground/80 hover:translate-x-1 hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        {/* Logout pinned to the bottom (brand #2EACEB background row) */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="brand-gradient flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:brightness-105 active:scale-95"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
