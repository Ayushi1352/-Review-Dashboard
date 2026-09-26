const DAY_MS = 86_400_000;
const LOCALE = 'en-IN';

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole calendar days from today until the given date (negative = past). */
export function daysUntil(iso) {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / DAY_MS);
}

export const isPast = (iso) => new Date(iso).getTime() < Date.now();

/** Human-friendly deadline label, e.g. "Due tomorrow", "Overdue by 2 days". */
export function dueLabel(iso) {
  const days = daysUntil(iso);
  if (isPast(iso)) {
    const ago = Math.abs(days);
    return ago === 0 ? 'Was due today' : `Overdue by ${ago} day${ago === 1 ? '' : 's'}`;
  }
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** ISO string -> "YYYY-MM-DD" (local time) for <input type="date">. */
export function toDateInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" -> ISO string at 11:59 PM local time (end of the due day). */
export function fromDateInput(value) {
  return new Date(`${value}T23:59:00`).toISOString();
}
