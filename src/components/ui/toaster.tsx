import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/toast.store';
import { cn } from '@/lib/utils';

const styles: Record<ToastType, { ring: string; icon: JSX.Element }> = {
  success: {
    ring: 'border-green-500',
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  },
  error: {
    ring: 'border-destructive',
    icon: <XCircle className="h-5 w-5 text-destructive" />,
  },
  warning: {
    ring: 'border-amber-500',
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-in slide-in-from-top-2 pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 bg-card p-3.5 shadow-lg ring-1 ring-border',
            styles[t.type].ring,
          )}
        >
          {styles[t.type].icon}
          <div className="flex-1 text-sm">{t.message}</div>
          <button
            onClick={() => remove(t.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
