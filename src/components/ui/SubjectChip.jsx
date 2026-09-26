import { cn } from '../../utils/cn';
import { subjectColor } from '../../utils/color';

export default function SubjectChip({ subject, className }) {
  return (
    <span
      className={cn(
        'inline-block max-w-full break-words rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        subjectColor(subject),
        className,
      )}
    >
      {subject}
    </span>
  );
}
