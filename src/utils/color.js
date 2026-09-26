export function hashString(value = '') {
  let hash = 0;
  for (const ch of value) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

// Full class strings so Tailwind can detect them at build time.
const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
];

const SUBJECT_COLORS = [
  'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'bg-sky-50 text-sky-700 ring-sky-600/15',
  'bg-violet-50 text-violet-700 ring-violet-600/15',
  'bg-orange-50 text-orange-700 ring-orange-600/15',
  'bg-teal-50 text-teal-700 ring-teal-600/15',
  'bg-pink-50 text-pink-700 ring-pink-600/15',
];

export const avatarColor = (seed) => AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
export const subjectColor = (subject) => SUBJECT_COLORS[hashString(subject.toLowerCase()) % SUBJECT_COLORS.length];
