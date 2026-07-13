import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({
  selected,
  onSelect,
  onClear,
}: {
  selected?: Date | null;
  onSelect: (date: Date) => void;
  onClear?: () => void;
}) {
  const today = new Date();
  const [view, setView] = useState<Date>(startOfMonth(selected ?? today));

  // Build a 6x7 grid starting on Sunday.
  const first = startOfMonth(view);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const monthLabel = view.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shift = (delta: number) =>
    setView(new Date(view.getFullYear(), view.getMonth() + delta, 1));

  return (
    <div className="w-[17rem] select-none">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-sm font-semibold">{monthLabel}</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-0.5 px-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5 px-1">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === view.getMonth();
          const isSelected = selected ? sameDay(d, selected) : false;
          const isToday = sameDay(d, today);
          return (
            <button
              type="button"
              key={i}
              onClick={() => onSelect(d)}
              className={cn(
                'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                !inMonth && 'text-muted-foreground/40',
                inMonth && !isSelected && 'hover:bg-accent',
                isSelected && 'brand-gradient font-semibold text-white shadow-sm',
                !isSelected && isToday && 'font-bold text-primary ring-1 ring-primary/40',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between px-1 pt-2">
        <button
          type="button"
          onClick={() => onClear?.()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            setView(startOfMonth(today));
            onSelect(today);
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Today
        </button>
      </div>
    </div>
  );
}
