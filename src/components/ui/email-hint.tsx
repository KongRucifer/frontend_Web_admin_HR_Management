import { Check, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EmailStatus } from '@/lib/use-email-status';

/** Inline availability feedback shown under an email input. */
export function EmailHint({ status }: { status: EmailStatus }) {
  const { t } = useTranslation();

  if (status === 'checking') {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('users.email_checking')}
      </p>
    );
  }
  if (status === 'invalid') {
    return (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <X className="h-3 w-3" />
        {t('employees.invalid_email')}
      </p>
    );
  }
  if (status === 'taken') {
    return (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <X className="h-3 w-3" />
        {t('users.email_taken')}
      </p>
    );
  }
  if (status === 'available') {
    return (
      <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        {t('users.email_available')}
      </p>
    );
  }
  return null;
}
