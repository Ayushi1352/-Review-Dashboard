import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

/** Circular progress indicator with arbitrary content in the middle. */
export default function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  trackClassName = 'stroke-slate-100',
  barClassName = 'stroke-indigo-600',
  label,
  children,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div
      role="img"
      aria-label={label ?? `${value}% complete`}
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={trackClassName} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(barClassName, 'transition-[stroke-dashoffset] duration-1000 ease-out')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
