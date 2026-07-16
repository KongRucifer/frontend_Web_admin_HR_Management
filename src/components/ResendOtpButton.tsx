import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

/**
 * "Resend code" with a cooldown, for OTP steps.
 *
 * The wait is not just politeness to the mail provider: every request REPLACES
 * the previous code server-side, so someone hammering this would keep
 * invalidating the code that is landing in their inbox — the flow gets slower,
 * not faster. Mounting starts the countdown, because reaching an OTP step always
 * means a code was just sent.
 */
export function ResendOtpButton({
  onResend,
  seconds = 60,
  disabled = false,
}: {
  onResend: () => void | Promise<void>;
  seconds?: number;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const waiting = left > 0;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || waiting}
      onClick={async () => {
        // Start the wait before awaiting the request: a slow network would
        // otherwise leave the button live long enough to double-send.
        setLeft(seconds);
        await onResend();
      }}
    >
      {waiting
        ? `${t('profile_settings.resend_otp')} (${left})`
        : t('profile_settings.resend_otp')}
    </Button>
  );
}
