import { useCheckEmail } from '@/api/hooks';
import { useDebounce } from '@/lib/use-debounce';

export type EmailStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Debounced availability status for an email input. Returns 'idle' when empty,
 * 'invalid' for a malformed address, 'checking' while the debounce settles or
 * the request is in flight, then 'available' / 'taken'. An email is "taken" if
 * it already belongs to a login account OR an employee record (backend rule).
 */
export function useEmailStatus(email: string): EmailStatus {
  const value = email.trim();
  const debounced = useDebounce(value, 400);
  const check = useCheckEmail(debounced);

  if (value.length === 0) return 'idle';
  if (!EMAIL_RE.test(value)) return 'invalid';
  if (debounced !== value || check.isFetching) return 'checking';
  if (check.data?.emailAvailable === false) return 'taken';
  if (check.data?.emailAvailable === true) return 'available';
  return 'idle';
}
