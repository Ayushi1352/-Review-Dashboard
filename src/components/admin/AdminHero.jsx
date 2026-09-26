import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import ProgressRing from '../ui/ProgressRing';
import { greeting } from '../../utils/date';

export default function AdminHero({ user, stats, onCreate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-950/20 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-indigo-200">
            {greeting()}, {user.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Your assignment review desk</h1>
          <p className="mt-2 text-sm text-indigo-100/80 sm:text-base">
            {stats.open} open assignment{stats.open === 1 ? '' : 's'} · {stats.received} of {stats.expected} submissions
            received across your classes.
          </p>
          <Button variant="white" icon={Plus} onClick={onCreate} size="lg" className="mt-5">
            New assignment
          </Button>
        </div>

        <div className="self-start md:self-auto">
          <ProgressRing
            value={stats.completion}
            size={136}
            stroke={12}
            trackClassName="stroke-white/15"
            barClassName="stroke-emerald-400"
            label={`${stats.completion}% overall submission rate`}
          >
            <span className="text-3xl font-bold tabular-nums">{stats.completion}%</span>
            <span className="text-xs text-indigo-200">submitted</span>
          </ProgressRing>
        </div>
      </div>
    </section>
  );
}
