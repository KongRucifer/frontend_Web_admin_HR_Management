import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((ok: boolean) => void) | null;
  show: (options: ConfirmOptions, resolve: (ok: boolean) => void) => void;
  close: (ok: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  show: (options, resolve) => set({ open: true, options, resolve }),
  close: (ok) => {
    get().resolve?.(ok);
    set({ open: false, options: null, resolve: null });
  },
}));

/** Awaitable confirmation: `if (await confirm({ title })) { ... }` */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().show(options, resolve);
  });
}
