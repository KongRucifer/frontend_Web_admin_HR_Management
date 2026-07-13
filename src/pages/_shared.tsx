import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';
import type { AttendanceStatus } from '@/types';

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

const statusVariant: Record<AttendanceStatus, 'success' | 'warning' | 'destructive' | 'muted'> = {
  present: 'success',
  late: 'warning',
  absent: 'destructive',
  leave: 'muted',
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { t } = useTranslation();
  return <Badge variant={statusVariant[status]}>{t(`status.${status}`)}</Badge>;
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
