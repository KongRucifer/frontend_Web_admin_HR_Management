import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCandidates, type ApproverInfo } from '@/api/approvals';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

/**
 * Search users (by name / phone / email) and collect several into a "bucket",
 * then confirm. Used to add leave-chain approvers and sick approvers.
 */
export function ApproverPickerDialog({
  open,
  onOpenChange,
  title,
  excludeUserIds = [],
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  excludeUserIds?: string[];
  onConfirm: (userIds: string[]) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [bucket, setBucket] = useState<ApproverInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const { data: candidates } = useCandidates(search);

  const excluded = useMemo(
    () => new Set([...excludeUserIds, ...bucket.map((b) => b.userId)]),
    [excludeUserIds, bucket],
  );
  const list = (candidates ?? []).filter((c) => !excluded.has(c.userId));

  const reset = () => {
    setSearch('');
    setBucket([]);
  };

  const submit = async () => {
    if (bucket.length === 0) return;
    setSaving(true);
    try {
      await onConfirm(bucket.map((b) => b.userId));
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('approvals.search_user')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Candidate results */}
        <div className="max-h-56 overflow-y-auto rounded-md border border-border">
          {list.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('common.no_data')}
            </div>
          ) : (
            list.map((c) => (
              <button
                key={c.userId}
                onClick={() => setBucket((b) => [...b, c])}
                className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left last:border-0 hover:bg-accent"
              >
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.phone ?? c.email}
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">
                  + {t('approvals.add')}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Bucket */}
        {bucket.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">
              {t('approvals.selected')} ({bucket.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {bucket.map((b, i) => (
                <span
                  key={b.userId}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {i + 1}. {b.name}
                  <button
                    onClick={() =>
                      setBucket((arr) => arr.filter((x) => x.userId !== b.userId))
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={bucket.length === 0 || saving}>
            <Check className="h-4 w-4" /> {t('approvals.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
