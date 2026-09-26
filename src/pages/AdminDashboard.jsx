import { useMemo, useState } from 'react';
import { CircleAlert, ClipboardList, Inbox, LayoutDashboard, Plus, TrendingUp, Users } from 'lucide-react';
import AdminHero from '../components/admin/AdminHero';
import AdminAssignmentCard from '../components/admin/AdminAssignmentCard';
import AssignmentFormModal from '../components/admin/AssignmentFormModal';
import DeleteAssignmentModal from '../components/admin/DeleteAssignmentModal';
import StudentProgressList from '../components/admin/StudentProgressList';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import SearchInput from '../components/ui/SearchInput';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { isPast } from '../utils/date';
import { percent } from '../utils/status';

const STATUS_FILTERS = {
  all: () => true,
  open: (a) => !isPast(a.dueDate),
  closed: (a) => isPast(a.dueDate),
};

/** Open assignments first by nearest deadline, then closed ones by most recent. */
function byDeadline(a, b) {
  const aClosed = isPast(a.dueDate);
  const bClosed = isPast(b.dueDate);
  if (aClosed !== bClosed) return aClosed ? 1 : -1;
  return aClosed ? new Date(b.dueDate) - new Date(a.dueDate) : new Date(a.dueDate) - new Date(b.dueDate);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const { assignments, students, loading, error, retry, createAssignment, updateAssignment, deleteAssignment } =
    useAdminDashboard(user.id);

  const [view, setView] = useState('assignments');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null); // { assignment: null | object }
  const [deleting, setDeleting] = useState(null);

  const studentsById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const subjects = useMemo(() => [...new Set(assignments.map((a) => a.subject))].sort(), [assignments]);

  const stats = useMemo(() => {
    let expected = 0;
    let received = 0;
    let missing = 0;
    const reached = new Set();
    assignments.forEach((a) => {
      expected += a.assignedTo.length;
      a.assignedTo.forEach((id) => reached.add(id));
      const count = a.assignedTo.filter((id) => a.submissions[id]).length;
      received += count;
      if (isPast(a.dueDate)) missing += a.assignedTo.length - count;
    });
    const open = assignments.filter((a) => !isPast(a.dueDate)).length;
    return { total: assignments.length, open, expected, received, missing, students: reached.size, completion: percent(received, expected) };
  }, [assignments]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignments
      .filter(STATUS_FILTERS[statusFilter])
      .filter((a) => !q || `${a.title} ${a.subject}`.toLowerCase().includes(q))
      .sort(byDeadline);
  }, [assignments, statusFilter, query]);

  const openCreate = () => setEditor({ assignment: null });

  async function handleSave(input) {
    if (editor.assignment) {
      await updateAssignment(editor.assignment.id, input);
      toast({ title: 'Assignment updated', description: input.title });
    } else {
      await createAssignment(input);
      toast({ title: 'Assignment published', description: `${input.title} is now visible to ${input.assignedTo.length} students.` });
      setView('assignments');
      setStatusFilter('all');
    }
    setEditor(null);
  }

  async function handleDelete(assignment) {
    await deleteAssignment(assignment.id);
    setDeleting(null);
    toast({ title: 'Assignment deleted', description: assignment.title, tone: 'info' });
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  const viewTabs = [
    { value: 'assignments', label: 'Assignments', icon: LayoutDashboard, count: stats.total },
    { value: 'students', label: 'Student progress', icon: Users, count: stats.students },
  ];

  const statusTabs = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open', count: stats.open },
    { value: 'closed', label: 'Closed', count: stats.total - stats.open },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminHero user={user} stats={stats} onCreate={openCreate} />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Assignments" value={stats.total} hint={`${stats.open} open · ${stats.total - stats.open} closed`} />
        <StatCard icon={Inbox} label="Submissions" value={`${stats.received}/${stats.expected}`} hint="Received vs. expected" tone="info" />
        <StatCard icon={TrendingUp} label="Completion rate" value={`${stats.completion}%`} hint={`Across ${stats.students} students`} tone="success" />
        <StatCard icon={CircleAlert} label="Missing" value={stats.missing} hint="Past deadline, not submitted" tone={stats.missing ? 'danger' : 'success'} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs tabs={viewTabs} value={view} onChange={setView} label="Dashboard view" />
          <div className="hidden shrink-0 sm:block">
            <Button icon={Plus} onClick={openCreate}>
              New assignment
            </Button>
          </div>
        </div>

        {view === 'assignments' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs tabs={statusTabs} value={statusFilter} onChange={setStatusFilter} label="Filter by status" />
              <SearchInput value={query} onChange={setQuery} placeholder="Search your assignments" className="sm:w-72" />
            </div>

            {visible.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {visible.map((assignment, index) => (
                  <AdminAssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    studentsById={studentsById}
                    onEdit={(a) => setEditor({ assignment: a })}
                    onDelete={setDeleting}
                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  />
                ))}
              </div>
            ) : assignments.length ? (
              <EmptyState icon={Inbox} title="No matching assignments" description="Try a different search or filter." />
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="Create your first assignment"
                description="Add a title, a due date and a Google Drive link. Students will see it on their dashboard instantly."
                action={
                  <Button icon={Plus} onClick={openCreate}>
                    New assignment
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <StudentProgressList assignments={assignments} students={students} />
        )}
      </section>

      {/* Floating action button on mobile */}
      <button
        type="button"
        onClick={openCreate}
        aria-label="New assignment"
        className="fixed bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {editor && (
        <AssignmentFormModal
          key={editor.assignment?.id ?? 'new'}
          assignment={editor.assignment}
          students={students}
          subjects={subjects}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}

      {deleting && (
        <DeleteAssignmentModal
          key={deleting.id}
          assignment={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
