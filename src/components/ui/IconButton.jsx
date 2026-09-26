import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  danger: 'text-slate-500 hover:bg-rose-50 hover:text-rose-600',
};

export default function IconButton({ label, icon: Icon, tone = 'neutral', className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        TONES[tone],
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
