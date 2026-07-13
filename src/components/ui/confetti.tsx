import { useEffect, useMemo, useState } from 'react';

const COLORS = [
  '#2EACEB',
  '#F97316',
  '#FACC15',
  '#22C55E',
  '#EC4899',
  '#8B5CF6',
];

/**
 * Lightweight CSS confetti burst (no emoji, no library). Plays once and
 * removes itself after the animation ends.
 */
export function Confetti({
  count = 110,
  duration = 6000,
}: {
  count?: number;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        fall: 2.6 + Math.random() * 2.4,
        color: COLORS[i % COLORS.length],
        width: 6 + Math.random() * 7,
        height: 8 + Math.random() * 8,
        drift: (Math.random() * 2 - 1) * 90,
        round: Math.random() > 0.7,
      })),
    [count],
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.width,
            height: p.height,
            borderRadius: p.round ? '9999px' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.fall}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
