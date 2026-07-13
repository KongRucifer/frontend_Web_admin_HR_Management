import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfirmStore } from '@/store/confirm.store';

/** Global confirmation dialog. Rendered once at the app root. */
export function ConfirmDialog() {
  const { t } = useTranslation();
  const { open, options, close } = useConfirmStore();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{options?.title}</DialogTitle>
        </DialogHeader>
        {options?.message && (
          <p className="text-sm text-muted-foreground">{options.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            {options?.cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={options?.danger ? 'destructive' : 'default'}
            onClick={() => close(true)}
          >
            {options?.confirmLabel ?? t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
