import { useCheckUsername } from '@/api/hooks';
import { useDebounce } from '@/lib/use-debounce';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

/**
 * Debounced availability status for a username input. Returns 'idle' for
 * inputs shorter than 3 chars (the backend's minimum), 'checking' while the
 * debounce settles or the request is in flight, then 'available' / 'taken'.
 */
export function useUsernameStatus(username: string): UsernameStatus {
  const value = username.trim();
  const debounced = useDebounce(value, 400);
  const check = useCheckUsername(debounced);

  if (value.length < 3) return 'idle';
  if (debounced !== value || check.isFetching) return 'checking';
  if (check.data?.usernameAvailable === false) return 'taken';
  if (check.data?.usernameAvailable === true) return 'available';
  return 'idle';
}
