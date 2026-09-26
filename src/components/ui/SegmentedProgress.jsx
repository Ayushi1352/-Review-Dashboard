import { cn } from '../../utils/cn';
import { STATUS_META } from '../../utils/status';

const SEGMENT_COLORS = {
  submitted: 'bg-emerald-500',
  late: 'bg-amber-400',
  missing: 'bg-rose-400',
  awaiting: 'bg-slate-200',
};

/**
 * One segment per student: the whole class at a glance.
 * `items` = [{ id, name, status }]
 */
export default function SegmentedProgress({ items, className }) {
  if (!items.length) return <div className={cn('h-2.5 rounded-full bg-slate-100', className)} />;

  return (
    <div className={cn('flex h-2.5 gap-0.5', className)} role="list" aria-label="Submission status per student">
      {items.map(({ id, name, status }, index) => (
        <span
          key={id}
          role="listitem"
          aria-label={`${name}: ${STATUS_META[status].label}`}
          title={`${name}: ${STATUS_META[status].label}`}
          style={{ animationDelay: `${index * 30}ms` }}
          className={cn(
            'h-full flex-1 animate-fade-in transition-transform first:rounded-l-full last:rounded-r-full hover:scale-y-150',
            SEGMENT_COLORS[status],
          )}
        />
      ))}
    </div>
  );
}

export function SegmentLegend({ counts }) {
  const entries = [
    ['submitted', 'On time'],
    ['late', 'Late'],
    ['missing', 'Missing'],
    ['awaiting', 'Pending'],
  ].filter(([key]) => counts[key] > 0);

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      {entries.map(([key, label]) => (
        <li key={key} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', SEGMENT_COLORS[key])} />
          {label} <span className="font-semibold text-slate-700">{counts[key]}</span>
        </li>
      ))}
    </ul>
  );
}
