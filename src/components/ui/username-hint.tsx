import { Check, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UsernameStatus } from '@/lib/use-username-status';

/** Inline availability feedback shown under a username input. */
export function UsernameHint({ status }: { status: UsernameStatus }) {
  const { t } = useTranslation();

  if (status === 'checking') {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('users.username_checking')}
      </p>
    );
  }
  if (status === 'taken') {
    return (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <X className="h-3 w-3" />
        {t('users.username_taken')}
      </p>
    );
  }
  if (status === 'available') {
    return (
      <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        {t('users.username_available')}
      </p>
    );
  }
  return null;
}
