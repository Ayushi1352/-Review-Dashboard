import { cn } from '../../utils/cn';
import { avatarColor } from '../../utils/color';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function initials(name = '') {
  return name
    .replace(/^(Dr|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({ name, size = 'md', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold',
        avatarColor(name),
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Overlapping avatars with a "+N" overflow bubble. */
export function AvatarStack({ names, max = 5, size = 'sm' }) {
  const visible = names.slice(0, max);
  const extra = names.length - visible.length;
  return (
    <div className="flex -space-x-2" title={names.join(', ')}>
      {visible.map((name) => (
        <Avatar key={name} name={name} size={size} className="ring-2 ring-white" />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            'inline-grid shrink-0 place-items-center rounded-full bg-slate-100 font-semibold text-slate-600 ring-2 ring-white',
            SIZES[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
