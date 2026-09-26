import { Clock } from 'lucide-react';
import ProgressRing from '../ui/ProgressRing';
import { dueLabel, greeting } from '../../utils/date';

function headlineFor(stats) {
  if (stats.total === 0) return 'No assignments yet';
  if (stats.completed === stats.total) return "You're all caught up!";
  if (stats.overdue > 0) return `${stats.overdue} assignment${stats.overdue > 1 ? 's are' : ' is'} overdue`;
  const open = stats.total - stats.completed;
  return `${open} assignment${open > 1 ? 's' : ''} waiting on you`;
}

export default function StudentHero({ user, stats, nextUp }) {
  const firstName = user.name.split(' ')[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-600/20 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />

      <div className="relative flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-indigo-100">
            {greeting()}, {firstName}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{headlineFor(stats)}</h1>
          <p className="mt-2 text-sm text-indigo-100/90 sm:text-base">
            You have completed <strong className="font-semibold text-white">{stats.completed}</strong> of{' '}
            <strong className="font-semibold text-white">{stats.total}</strong> assignments this term.
          </p>

          {nextUp && (
            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15">
                <Clock className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">Up next</p>
                <p className="break-words font-semibold">{nextUp.title}</p>
                <p className="text-xs text-indigo-100">{dueLabel(nextUp.dueDate)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="self-start md:self-auto">
          <ProgressRing
            value={stats.completion}
            size={136}
            stroke={12}
            trackClassName="stroke-white/20"
            barClassName="stroke-white"
            label={`${stats.completion}% of assignments completed`}
          >
            <span className="text-3xl font-bold tabular-nums">{stats.completion}%</span>
            <span className="text-xs text-indigo-100">completed</span>
          </ProgressRing>
        </div>
      </div>
    </section>
  );
}
