import { Menu } from 'lucide-react';
import { HeaderControls } from './HeaderControls';

/** Sidebar-mode top bar: hamburger (mobile) + shared right-hand controls. */
export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
      <button className="lg:hidden" onClick={onMenu}>
        <Menu className="h-6 w-6" />
      </button>
      <div className="ml-auto">
        {/* Logout lives at the bottom of the sidebar in this mode. */}
        <HeaderControls showLogout={false} />
      </div>
    </header>
  );
}
