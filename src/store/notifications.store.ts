import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotifState {
  /** Set of read notification keys (occurrence-scoped, so they reset yearly). */
  read: Record<string, true>;
  markRead: (key: string) => void;
}

export const useNotificationStore = create<NotifState>()(
  persist(
    (set) => ({
      read: {},
      markRead: (key) =>
        set((s) => (s.read[key] ? s : { read: { ...s.read, [key]: true } })),
    }),
    { name: 'hrapp-notif-read' },
  ),
);
