import { cn } from '../../utils/cn';

/** Segmented control. Tabs wrap onto a new row on narrow screens, so none is ever hidden. */
export default function Tabs({ tabs, value, onChange, label, className }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-200/60 p-1', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition sm:flex-none',
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-300/50 text-slate-500',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
