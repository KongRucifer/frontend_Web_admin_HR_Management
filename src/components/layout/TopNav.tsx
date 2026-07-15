import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { Logo } from '@/components/Logo';
import { HeaderControls } from './HeaderControls';
import { navItems } from './nav-items';

/** Header-mode navigation: row 1 = brand + controls, row 2 = menu. */
export function TopNav() {
  const { t } = useTranslation();
  const setMobileOpen = useUIStore((s) => s.setMobileOpen);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
      {/* Row 1: brand (left) + controls (right) */}
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-9 w-auto" />
          <span className="hidden text-base font-semibold sm:block">
            {t('app.title')}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <HeaderControls />
          {/* Mobile hamburger opens the drawer */}
          <button
            className="rounded-full border border-border p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Row 2: horizontal menu (desktop only; mobile uses the drawer) */}
      <div className="mx-auto hidden max-w-[1600px] px-4 lg:block lg:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 py-2">
          {navItems.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.04] active:scale-95',
                  isActive
                    ? 'brand-gradient text-white shadow-md shadow-primary/30'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-[17px] w-[17px]" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
