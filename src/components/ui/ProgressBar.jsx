import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { percent } from '../../utils/status';

const TONES = {
  brand: 'bg-linear-to-r from-indigo-500 to-violet-500',
  success: 'bg-linear-to-r from-emerald-400 to-emerald-500',
  warning: 'bg-linear-to-r from-amber-400 to-amber-500',
  danger: 'bg-linear-to-r from-rose-400 to-rose-500',
  white: 'bg-white',
};

const SIZES = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

/** Picks a colour from the completion level: red -> amber -> indigo -> green. */
export function toneFor(pct) {
  if (pct >= 100) return 'success';
  if (pct >= 50) return 'brand';
  if (pct > 0) return 'warning';
  return 'danger';
}

export default function ProgressBar({ value, max = 100, tone = 'auto', size = 'md', label, className, trackClassName }) {
  const pct = percent(value, max);
  // Start at 0 and animate to the real value after mount for a smooth fill.
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('w-full overflow-hidden rounded-full bg-slate-100', SIZES[size], trackClassName, className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', TONES[tone === 'auto' ? toneFor(pct) : tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
