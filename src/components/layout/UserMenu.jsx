import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, RotateCcw } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function UserMenu() {
  const { user, logout, resetDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const subtitle = user.role === 'admin' ? user.department : user.rollNo;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition hover:bg-slate-100"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-slate-900">{user.name}</span>
          <span className="block text-xs leading-tight text-slate-500">{subtitle}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 origin-top-right animate-slide-up rounded-2xl bg-white p-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200"
        >
          <div className="border-b border-slate-100 px-3 pb-3 pt-2">
            <p className="break-words text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="break-words text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={resetDemo}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
