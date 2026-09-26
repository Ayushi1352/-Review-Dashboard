import { daysUntil, isPast } from './date';

/**
 * Status of one student's work on one assignment, from the student's view.
 * submitted | late | overdue | due-soon | pending
 */
export function getStudentStatus(dueDate, submittedAt) {
  if (submittedAt) return new Date(submittedAt) > new Date(dueDate) ? 'late' : 'submitted';
  if (isPast(dueDate)) return 'overdue';
  if (daysUntil(dueDate) <= 2) return 'due-soon';
  return 'pending';
}

/**
 * The same data from the professor's view.
 * submitted | late | missing | awaiting
 */
export function getSubmissionStatus(dueDate, submittedAt) {
  if (submittedAt) return new Date(submittedAt) > new Date(dueDate) ? 'late' : 'submitted';
  return isPast(dueDate) ? 'missing' : 'awaiting';
}

export const isDone = (status) => status === 'submitted' || status === 'late';

export const STATUS_META = {
  submitted: { label: 'Submitted', tone: 'success' },
  late: { label: 'Submitted late', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  pending: { label: 'Pending', tone: 'brand' },
  missing: { label: 'Missing', tone: 'danger' },
  awaiting: { label: 'Not submitted', tone: 'neutral' },
};

export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
