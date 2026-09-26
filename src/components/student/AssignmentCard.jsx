import { CalendarDays, CheckCircle2, ExternalLink, FolderOpen, Send } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import SubjectChip from '../ui/SubjectChip';
import { cn } from '../../utils/cn';
import { dueLabel, formatDate, formatDateTime } from '../../utils/date';
import { isDone } from '../../utils/status';

const ACCENTS = {
  submitted: 'bg-emerald-500',
  late: 'bg-amber-400',
  overdue: 'bg-rose-500',
  'due-soon': 'bg-amber-400',
  pending: 'bg-indigo-500',
};

const DUE_TONES = {
  overdue: 'text-rose-600 font-medium',
  'due-soon': 'text-amber-700 font-medium',
  pending: 'text-slate-500',
};

export default function AssignmentCard({ assignment, onSubmit, style }) {
  const { title, subject, description, dueDate, driveLink, professor, submittedAt, status } = assignment;
  const done = isDone(status);

  return (
    <article
      style={style}
      className="group relative flex animate-slide-up flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70"
    >
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', ACCENTS[status])} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <SubjectChip subject={subject} />
          <StatusBadge status={status} />
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}

        <dl className="mt-auto space-y-2 pt-4 text-sm">
          {professor && (
            <div className="flex items-center gap-2 text-slate-600">
              <dt className="sr-only">Professor</dt>
              <Avatar name={professor.name} size="xs" />
              <dd className="min-w-0 break-words">{professor.name}</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <dt className="sr-only">Due date</dt>
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            <dd className="text-slate-600">
              {formatDate(dueDate)}
              {!done && <span className={cn('ml-1.5', DUE_TONES[status])}>· {dueLabel(dueDate)}</span>}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        {done ? (
          <div className="flex items-center justify-between gap-3">
            <p className={cn('flex items-center gap-2 text-sm font-medium', status === 'late' ? 'text-amber-700' : 'text-emerald-700')}>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Submitted {formatDateTime(submittedAt)}</span>
            </p>
            <a
              href={driveLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              Drive <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button as="a" href={driveLink} target="_blank" rel="noreferrer" variant="secondary" icon={FolderOpen}>
              Open Drive
            </Button>
            <Button icon={Send} onClick={() => onSubmit(assignment)} variant={status === 'overdue' ? 'danger' : 'primary'}>
              Submit
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
