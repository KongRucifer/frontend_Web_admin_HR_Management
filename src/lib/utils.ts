import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ISO string as a locale date-time (or "-" when empty). */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('en-GB', {
    timeZone: 'Asia/Vientiane',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Vientiane',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Vientiane',
    hour: '2-digit',
    minute: '2-digit',
  });
}
