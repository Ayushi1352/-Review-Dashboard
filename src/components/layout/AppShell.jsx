import { GraduationCap, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import UserMenu from './UserMenu';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function AppShell({ children }) {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-linear-to-b from-indigo-100/60 via-slate-50 to-slate-50"
      />

      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:block">
              <Badge tone={isAdmin ? 'brand' : 'success'} icon={isAdmin ? ShieldCheck : GraduationCap}>
                {isAdmin ? 'Professor' : 'Student'}
              </Badge>
            </span>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        Assignly demo · data is simulated and stored in your browser
      </footer>
    </div>
  );
}
