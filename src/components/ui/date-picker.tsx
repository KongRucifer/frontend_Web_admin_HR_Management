import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

/** Formats a Date to "YYYY-MM-DD" in local time (matches <input type=date>). */
function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function parse(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parse(value);

  const display = selected
    ? selected.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : placeholder;

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
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className={cn(!selected && 'text-muted-foreground')}>{display}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          selected={selected}
          onSelect={(d) => {
            onChange(toISO(d));
            setOpen(false);
          }}
          onClear={() => {
            onChange('');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
