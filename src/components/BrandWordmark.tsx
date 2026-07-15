import { cn } from '@/lib/utils';

/**
 * The wordmark that sits UNDER the logo image:
 *
 *     HR MANAGEMENT
 *   — PEOPLE. CULTURE. SUCCESS. —
 *
 * Written as text (the logo image itself is untouched). The navy reads well on
 * white but vanishes on a dark background, so the colours flip in dark mode.
 */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="text-2xl leading-none tracking-wide">
        {/* "HR" heavy + dark, "MANAGEMENT" lighter — as on the brand sheet. */}
        <span className="font-extrabold text-[#16264A] dark:text-[#EAF2FB]">
          HR
        </span>
        <span className="font-medium text-[#2E5C8A] dark:text-[#9DBBDD]">
          {' '}
          MANAGEMENT
        </span>
      </div>
      {/* Tagline flanked by short rules. */}
      <div className="mt-1.5 flex items-center gap-2">
        <span className="h-px w-5 bg-[#2E6DA4]/45 dark:bg-[#6FB6E8]/45" />
        <span className="text-[9px] font-semibold tracking-[0.15em] text-[#2E6DA4] dark:text-[#6FB6E8]">
          PEOPLE. CULTURE. SUCCESS.
        </span>
        <span className="h-px w-5 bg-[#2E6DA4]/45 dark:bg-[#6FB6E8]/45" />
      </div>
    </div>
  );
}
