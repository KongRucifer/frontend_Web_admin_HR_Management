import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        success:
          'border-transparent bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        warning:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        destructive:
          'border-transparent bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
