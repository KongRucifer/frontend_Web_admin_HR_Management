import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NavMode = 'header' | 'sidebar';

interface UIState {
  /** How the main navigation is displayed. Default = header (top menu). */
  navMode: NavMode;
  /** Mobile off-canvas drawer open state (not persisted). */
  mobileOpen: boolean;
  setNavMode: (mode: NavMode) => void;
  toggleNavMode: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      navMode: 'header',
      mobileOpen: false,
      setNavMode: (navMode) => set({ navMode }),
      toggleNavMode: () =>
        set((s) => ({ navMode: s.navMode === 'header' ? 'sidebar' : 'header' })),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
    }),
    {
      name: 'hrapp-ui',
      partialize: (s) => ({ navMode: s.navMode }),
    },
  ),
);
