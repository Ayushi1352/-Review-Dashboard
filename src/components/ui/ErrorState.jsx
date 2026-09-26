import { CircleAlert, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-rose-100">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
        <CircleAlert className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-semibold text-slate-900">Something went wrong</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      <Button variant="secondary" icon={RotateCcw} onClick={onRetry} className="mt-5">
        Try again
      </Button>
    </div>
  );
}
