import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const pad = (n: number) => `${n}`.padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 00,05,...,55

/** Column of selectable numbers that scrolls the active value into view on open. */
function Column({
  items,
  value,
  onSelect,
  open,
}: {
  items: number[];
  value: number | null;
  onSelect: (n: number) => void;
  open: boolean;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) activeRef.current?.scrollIntoView({ block: 'center' });
  }, [open]);

  return (
    <div className="max-h-56 w-16 overflow-y-auto rounded-md border border-border p-1">
      {items.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            ref={active ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(n)}
            className={cn(
              'mb-0.5 flex w-full items-center justify-center rounded-md py-1.5 text-sm transition-colors',
              active
                ? 'brand-gradient font-semibold text-white'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {pad(n)}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  placeholder = '--:--',
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const hh = value ? parseInt(value.slice(0, 2), 10) : null;
  const mm = value ? parseInt(value.slice(3, 5), 10) : null;

  const emit = (h: number | null, m: number | null) =>
    onChange(`${pad(h ?? 0)}:${pad(m ?? 0)}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-left text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            className,
          )}
        >
          <Clock className="h-4 w-4 text-primary" />
          <span className={cn(!value && 'text-muted-foreground')}>
            {value ? value.slice(0, 5) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex gap-2">
          <div className="text-center">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Hour</div>
            <Column items={HOURS} value={hh} open={open} onSelect={(h) => emit(h, mm)} />
          </div>
          <div className="text-center">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Min</div>
            <Column items={MINUTES} value={mm} open={open} onSelect={(m) => emit(hh, m)} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
