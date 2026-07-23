import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { ActorRef, AttendanceStatus, RequestKind } from '@/types';

/** Confirm dialog → delete → success/error toast. Reused across tables. */
export async function confirmDelete(
  t: (k: string) => string,
  mutateAsync: (id: string) => Promise<unknown>,
  id: string,
  message?: string,
) {
  const ok = await confirm({
    title: t('common.confirm_delete'),
    message,
    danger: true,
  });
  if (!ok) return;
  try {
    await mutateAsync(id);
    toast.success(t('common.deleted'));
  } catch (e: any) {
    toast.error(e?.apiMessage || t('common.error'));
  }
}

// A Record (not a partial map) on purpose: adding an AttendanceStatus member
// is a compile error here until it gets a variant.
const statusVariant: Record<
  AttendanceStatus,
  'success' | 'warning' | 'destructive' | 'muted' | 'default'
> = {
  on_time: 'success',
  late: 'warning',
  absent: 'destructive',
  leave: 'muted',
  emergency: 'default',
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { t } = useTranslation();
  return <Badge variant={statusVariant[status]}>{t(`status.${status}`)}</Badge>;
}

/** Marks a day whose check-out was before the schedule's end time. */
export function LeftEarlyBadge({ leftEarly }: { leftEarly?: boolean }) {
  const { t } = useTranslation();
  if (!leftEarly) return null;
  return <Badge variant="warning">{t('status.left_early')}</Badge>;
}

/**
 * Departure status, shown in its own column: "left early" (warning) when the
 * check-out was before the schedule end, "on time" (success) for a normal
 * check-out, or a dash when the employee has not checked out (absent / leave /
 * still working).
 */
export function CheckOutStatusBadge({
  checkOutTime,
  leftEarly,
}: {
  checkOutTime?: string | null;
  leftEarly?: boolean;
}) {
  const { t } = useTranslation();
  if (!checkOutTime) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (leftEarly) {
    return <Badge variant="warning">{t('status.left_early')}</Badge>;
  }
  return <Badge variant="success">{t('status.on_time_out')}</Badge>;
}

/**
 * Small badge shown beside the Date cell when the day is covered by an approved
 * request. Renders the request's type name ("Annual leave", "Illness"), falling
 * back to the generic kind label. Returns null for ordinary days, so unaffected
 * rows lay out exactly as before.
 */
export function RequestTypeBadge({
  kind,
  name,
}: {
  kind: RequestKind | null;
  name: string | null;
}) {
  const { t } = useTranslation();
  if (!kind) return null;
  return (
    <Badge variant={kind === 'leave' ? 'muted' : 'default'}>
      {name ?? t(`status.${kind}`)}
    </Badge>
  );
}

/** Renders the username (or email) of a created_by / updated_by actor. */
export function ActorCell({ actor }: { actor?: ActorRef | null }) {
  const label = actor?.username || actor?.email;
  return (
    <span className="text-sm text-muted-foreground">{label ?? '—'}</span>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        ‹
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        ›
      </Button>
    </div>
  );
}
