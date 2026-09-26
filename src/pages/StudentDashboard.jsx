import { useMemo, useState } from 'react';
import { CircleAlert, ClipboardList, Clock, Inbox, ListChecks, TrendingUp } from 'lucide-react';
import StudentHero from '../components/student/StudentHero';
import AssignmentCard from '../components/student/AssignmentCard';
import SubmitConfirmModal from '../components/student/SubmitConfirmModal';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useStudentAssignments } from '../hooks/useStudentAssignments';
import { getStudentStatus, isDone, percent } from '../utils/status';

const FILTERS = {
  all: () => true,
  pending: (a) => a.status === 'pending' || a.status === 'due-soon',
  overdue: (a) => a.status === 'overdue',
  completed: (a) => isDone(a.status),
};

/** Open work first (earliest deadline on top), then completed work (most recent first). */
function byPriority(a, b) {
  const aDone = isDone(a.status);
  const bDone = isDone(b.status);
  if (aDone !== bDone) return aDone ? 1 : -1;
  if (aDone) return new Date(b.submittedAt) - new Date(a.submittedAt);
  return new Date(a.dueDate) - new Date(b.dueDate);
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const { assignments, loading, error, retry, submit } = useStudentAssignments(user.id);

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(null);

  const items = useMemo(
    () =>
      assignments
        .map((a) => ({ ...a, status: getStudentStatus(a.dueDate, a.submittedAt) }))
        .sort(byPriority),
    [assignments],
  );

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((a) => isDone(a.status)).length;
    const overdue = items.filter((a) => a.status === 'overdue').length;
    return { total, completed, overdue, pending: total - completed - overdue, completion: percent(completed, total) };
  }, [items]);

  const nextUp = items.find((a) => !isDone(a.status) && a.status !== 'overdue');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(FILTERS[filter])
      .filter((a) => !q || `${a.title} ${a.subject} ${a.professor?.name ?? ''}`.toLowerCase().includes(q));
  }, [items, filter, query]);

  async function handleConfirm(assignment) {
    const submittedAt = await submit(assignment.id);
    toast({ title: 'Submission confirmed', description: assignment.title });
    return submittedAt;
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  const tabs = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'overdue', label: 'Overdue', count: stats.overdue },
    { value: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <StudentHero user={user} stats={stats} nextUp={nextUp} />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total assigned" value={stats.total} hint="Across all subjects" />
        <StatCard icon={ListChecks} label="Completed" value={stats.completed} hint={`${stats.completion}% completion rate`} tone="success" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} hint={nextUp ? `Next: ${nextUp.title}` : 'Nothing upcoming'} tone="info" />
        <StatCard icon={CircleAlert} label="Overdue" value={stats.overdue} hint={stats.overdue ? 'Submit these first' : 'Great, none!'} tone={stats.overdue ? 'danger' : 'success'} />
      </section>

      <section aria-labelledby="assignments-heading" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <h2 id="assignments-heading" className="text-lg font-bold text-slate-900">
              My assignments
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs tabs={tabs} value={filter} onChange={setFilter} label="Filter assignments" />
            <SearchInput value={query} onChange={setQuery} placeholder="Search assignments" className="sm:w-64" />
          </div>
        </div>

        {visible.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((assignment, index) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={setConfirming}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={query ? 'No matching assignments' : 'Nothing here'}
            description={
              query ? `Nothing matches "${query}". Try another search.` : 'No assignments in this category right now.'
            }
          />
        )}
      </section>

      {confirming && (
        <SubmitConfirmModal
          key={confirming.id}
          assignment={confirming}
          onClose={() => setConfirming(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
