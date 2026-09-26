import { cn } from '../../utils/cn';

const TONES = {
  brand: 'bg-indigo-50 text-indigo-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md sm:p-5">
      <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', TONES[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 break-words text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
