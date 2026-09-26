import { useMemo, useState } from 'react';
import { ChevronRight, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ProgressBar from '../ui/ProgressBar';
import SearchInput from '../ui/SearchInput';
import StatusBadge from '../ui/StatusBadge';
import SubjectChip from '../ui/SubjectChip';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/date';
import { getSubmissionStatus, percent } from '../../utils/status';

const SORTS = {
  'progress-asc': { label: 'Needs attention first', fn: (a, b) => a.pct - b.pct || b.missing - a.missing },
  'progress-desc': { label: 'Top performers first', fn: (a, b) => b.pct - a.pct },
  name: { label: 'Name (A–Z)', fn: (a, b) => a.student.name.localeCompare(b.student.name) },
};

const GRID = 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_90px_90px_40px]';

/**
 * One row per student with an individual progress bar showing how many of
 * THIS professor's assignments they have submitted. Expand a row for detail.
 */
export default function StudentProgressList({ assignments, students }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('progress-asc');
  const [openId, setOpenId] = useState(null);

  const rows = useMemo(
    () =>
      students
        .map((student) => {
          const items = assignments
            .filter((a) => a.assignedTo.includes(student.id))
            .map((a) => ({ assignment: a, status: getSubmissionStatus(a.dueDate, a.submissions[student.id]) }));
          const done = items.filter((i) => i.status === 'submitted' || i.status === 'late').length;
          const missing = items.filter((i) => i.status === 'missing').length;
          return { student, items, done, missing, total: items.length, pct: percent(done, items.length) };
        })
        .filter((row) => row.total > 0),
    [assignments, students],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !q || `${r.student.name} ${r.student.email} ${r.student.rollNo}`.toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [rows, query, sort]);

  if (!rows.length) {
    return (
      <EmptyState
        icon={Users}
        title="No students yet"
        description="Once you assign work to students, their individual progress shows up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search students" className="sm:w-72" />
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 flex-1 rounded-xl bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-500 sm:flex-none"
          >
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className={cn('hidden gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid', GRID)}>
          <span>Student</span>
          <span>Progress</span>
          <span className="text-center">Submitted</span>
          <span className="text-center">Missing</span>
          <span />
        </div>

        {visible.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No students match “{query}”.</p>}

        <ul className="divide-y divide-slate-100">
          {visible.map(({ student, items, done, missing, total, pct }) => {
            const open = openId === student.id;
            return (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : student.id)}
                  aria-expanded={open}
                  className={cn('grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 text-left transition hover:bg-slate-50', GRID)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={student.name} />
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-semibold text-slate-900">{student.name}</span>
                      <span className="block break-words text-xs text-slate-500">{student.rollNo}</span>
                    </span>
                  </span>

                  <ChevronRight className={cn('h-4 w-4 justify-self-end text-slate-400 transition md:hidden', open && 'rotate-90')} />

                  <span className="col-span-2 flex items-center gap-3 md:col-span-1">
                    <ProgressBar value={done} max={total} label={`${student.name}: ${pct}% submitted`} />
                    <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">{pct}%</span>
                  </span>

                  <span className="hidden text-center text-sm tabular-nums text-slate-700 md:block">
                    {done}/{total}
                  </span>
                  <span className="hidden text-center md:block">
                    {missing > 0 ? (
                      <span className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-rose-50 px-1.5 text-xs font-semibold text-rose-600">
                        {missing}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">–</span>
                    )}
                  </span>
                  <ChevronRight className={cn('hidden h-4 w-4 justify-self-end text-slate-400 transition md:block', open && 'rotate-90')} />

                  <span className="col-span-2 flex gap-4 text-xs text-slate-500 md:hidden">
                    <span>
                      <strong className="text-slate-700">{done}</strong>/{total} submitted
                    </span>
                    {missing > 0 && <span className="font-medium text-rose-600">{missing} missing</span>}
                  </span>
                </button>

                {open && (
                  <ul className="animate-fade-in space-y-2 bg-slate-50/70 px-5 py-4">
                    {items.map(({ assignment, status }) => (
                      <li
                        key={assignment.id}
                        className="flex flex-col gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-slate-900">{assignment.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <SubjectChip subject={assignment.subject} />
                            Due {formatDate(assignment.dueDate)}
                          </div>
                        </div>
                        <StatusBadge status={status} className="self-start sm:self-auto" />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
