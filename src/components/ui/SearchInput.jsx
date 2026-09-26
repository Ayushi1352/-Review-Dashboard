import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
