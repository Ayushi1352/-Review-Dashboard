import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ExternalLink, FolderOpen, Pencil, Trash2, Users } from 'lucide-react';
import Avatar, { AvatarStack } from '../ui/Avatar';
import Badge from '../ui/Badge';
import IconButton from '../ui/IconButton';
import ProgressBar from '../ui/ProgressBar';
import SegmentedProgress, { SegmentLegend } from '../ui/SegmentedProgress';
import StatusBadge from '../ui/StatusBadge';
import SubjectChip from '../ui/SubjectChip';
import { cn } from '../../utils/cn';
import { dueLabel, formatDate, formatDateTime, isPast } from '../../utils/date';
import { getSubmissionStatus, percent } from '../../utils/status';

const ROSTER_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Submitted' },
  { value: 'open', label: 'Not submitted' },
];

export default function AdminAssignmentCard({ assignment, studentsById, onEdit, onDelete, style }) {
  const [expanded, setExpanded] = useState(false);
  const [rosterFilter, setRosterFilter] = useState('all');
  const { title, subject, description, dueDate, driveLink, assignedTo, submissions } = assignment;
  const closed = isPast(dueDate);

  const roster = useMemo(
    () =>
      assignedTo
        .map((id) => studentsById.get(id))
        .filter(Boolean)
        .map((student) => ({
          student,
          submittedAt: submissions[student.id] ?? null,
          status: getSubmissionStatus(dueDate, submissions[student.id]),
        }))
        .sort((a, b) => a.student.name.localeCompare(b.student.name)),
    [assignedTo, studentsById, submissions, dueDate],
  );

  const counts = useMemo(() => {
    const c = { submitted: 0, late: 0, missing: 0, awaiting: 0 };
    roster.forEach((r) => {
      c[r.status] += 1;
    });
    return c;
  }, [roster]);

  const submittedCount = counts.submitted + counts.late;
  const total = roster.length;
  const pct = percent(submittedCount, total);

  const visibleRoster = roster.filter((r) =>
    rosterFilter === 'all' ? true : rosterFilter === 'done' ? Boolean(r.submittedAt) : !r.submittedAt,
  );

  return (
    <article style={style} className="animate-slide-up overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SubjectChip subject={subject} />
              <Badge tone={closed ? 'neutral' : 'success'} dot>
                {closed ? 'Closed' : 'Open'}
              </Badge>
            </div>
            <h3 className="mt-2.5 text-lg font-semibold leading-snug text-slate-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <IconButton label="Edit assignment" icon={Pencil} onClick={() => onEdit(assignment)} />
            <IconButton label="Delete assignment" icon={Trash2} tone="danger" onClick={() => onDelete(assignment)} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {formatDate(dueDate)}
            <span className={cn('font-medium', closed ? 'text-slate-400' : 'text-indigo-600')}>· {dueLabel(dueDate)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-400" /> {total} student{total === 1 ? '' : 's'}
          </span>
          <a
            href={driveLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            <FolderOpen className="h-4 w-4" /> Drive folder <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">Submissions</span>
            <span className="text-slate-500">
              <span className="font-semibold tabular-nums text-slate-900">{submittedCount}</span>/{total} ·{' '}
              <span className="font-semibold tabular-nums text-slate-900">{pct}%</span>
            </span>
          </div>
          <SegmentedProgress items={roster.map((r) => ({ id: r.student.id, name: r.student.name, status: r.status }))} />
          <div className="mt-2.5">
            <SegmentLegend counts={counts} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {submittedCount > 0 ? (
            <AvatarStack names={roster.filter((r) => r.submittedAt).map((r) => r.student.name)} size="xs" max={6} />
          ) : (
            <span className="text-xs text-slate-400">No submissions yet</span>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            {expanded ? 'Hide' : 'View'} students
            <ChevronDown className={cn('h-4 w-4 transition', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {ROSTER_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setRosterFilter(f.value)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition',
                  rosterFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visibleRoster.length ? (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/70">
              {visibleRoster.map(({ student, submittedAt, status }) => (
                <li key={student.id} className="flex items-start gap-3 px-4 py-3 sm:items-center">
                  <Avatar name={student.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-slate-900">{student.name}</p>
                    <p className="break-words text-xs text-slate-500">
                      {submittedAt ? `Submitted ${formatDateTime(submittedAt)}` : student.rollNo}
                    </p>
                    {/* Mobile: individual bar + status sit under the name */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 sm:hidden">
                      <div className="w-20">
                        <ProgressBar
                          value={submittedAt ? 100 : 0}
                          size="sm"
                          tone={status === 'late' ? 'warning' : 'success'}
                          label={`${student.name} submission`}
                        />
                      </div>
                      <StatusBadge status={status} />
                    </div>
                  </div>
                  <div className="hidden w-24 shrink-0 sm:block">
                    <ProgressBar
                      value={submittedAt ? 100 : 0}
                      size="sm"
                      tone={status === 'late' ? 'warning' : 'success'}
                      label={`${student.name} submission`}
                    />
                  </div>
                  <span className="hidden shrink-0 sm:block">
                    <StatusBadge status={status} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/70">
              No students in this view.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
