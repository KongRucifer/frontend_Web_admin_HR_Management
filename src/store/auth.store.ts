import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  ready: boolean; // true once we've checked the session on load
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

/**
 * Auth is backed by an httpOnly cookie (invisible to JS). We keep only a light
 * copy of the user profile in memory + localStorage for instant UI; the cookie
 * is the source of truth and is re-validated via fetchMe() on load.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      ready: false,

      login: async (email, password) => {
        await api.post('/auth/login', { email, password });
        const me = await api.get<AuthUser>('/auth/me');
        // Allow the birthday toast to show again on this fresh login.
        sessionStorage.removeItem('bday-toast-shown');
        set({ user: me.data, ready: true });
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          set({ user: null });
        }
      },

      fetchMe: async () => {
        try {
          const me = await api.get<AuthUser>('/auth/me');
          set({ user: me.data, ready: true });
        } catch {
          set({ user: null, ready: true });
        }
      },
    }),
    {
      name: 'hrapp-admin-auth',
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
