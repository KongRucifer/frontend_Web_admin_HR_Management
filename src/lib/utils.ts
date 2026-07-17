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

/**
 * Decimal hours -> "X hr Y min" (localised units), so 0.21 reads as "12 min"
 * and 8.5 as "8 hr 30 min". Whole hours drop the minutes; under an hour drops
 * the hours. Pass the unit words so this stays i18n-free.
 */
export function formatHoursMinutes(
  hours: number | null | undefined,
  hr: string,
  min: string,
): string {
  if (hours == null) return '-';
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${h} ${hr} ${m} ${min}`;
  if (h) return `${h} ${hr}`;
  return `${m} ${min}`;
}

export function formatTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Vientiane',
    hour: '2-digit',
    minute: '2-digit',
  });
}
