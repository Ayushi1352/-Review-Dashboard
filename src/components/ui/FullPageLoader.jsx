import Logo from '../layout/Logo';

export default function FullPageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex animate-pulse flex-col items-center gap-3">
        <Logo />
        <p className="text-sm text-slate-400">Loading your workspace…</p>
      </div>
    </div>
  );
}
