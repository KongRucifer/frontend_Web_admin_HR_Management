import { cn } from '@/lib/utils';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';

/**
 * Brand logo image. Automatically swaps between the light- and dark-theme
 * variants (class-based Tailwind dark mode). Pass a height via `className`
 * (e.g. "h-9 w-auto"); width auto-scales to keep the aspect ratio.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img
        src={logoLight}
        alt="LTS HR"
        className={cn('block dark:hidden', className)}
      />
      <img
        src={logoDark}
        alt="LTS HR"
        className={cn('hidden dark:block', className)}
      />
    </>
  );
}
