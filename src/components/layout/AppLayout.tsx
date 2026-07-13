import { Outlet, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { BirthdayToast } from './BirthdayToast';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TopNav } from './TopNav';

export function AppLayout() {
  const navMode = useUIStore((s) => s.navMode);
  const mobileOpen = useUIStore((s) => s.mobileOpen);
  const setMobileOpen = useUIStore((s) => s.setMobileOpen);
  const location = useLocation();

  // Sidebar mode: docked sidebar on desktop + drawer on mobile.
  if (navMode === 'sidebar') {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div key={location.pathname} className="animate-page mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        <BirthdayToast />
      </div>
    );
  }

  // Header mode (default): horizontal top menu, sidebar only as a mobile drawer.
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav />
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        mobileOnly
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div key={location.pathname} className="animate-page mx-auto max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      <BirthdayToast />
    </div>
  );
}
