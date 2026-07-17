import { create } from 'zustand';

/**
 * Live unread-notification count, kept fresh by the socket's `unread` event
 * (and seeded by an initial fetch). The bell badge reads it; marking things
 * read on the server emits a new `unread` which flows back here.
 */
interface LiveNotifState {
  unread: number;
  setUnread: (n: number) => void;
}

export const useLiveNotifStore = create<LiveNotifState>((set) => ({
  unread: 0,
  setUnread: (n) => set({ unread: Math.max(0, n) }),
}));
