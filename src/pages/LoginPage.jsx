import { useState } from 'react';
import { CheckCircle2, CircleAlert, Eye, EyeOff, GraduationCap, Loader2, Lock, LogIn, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from '../components/layout/Logo';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';
import { DEMO_PASSWORD } from '../data/seed';
import { cn } from '../utils/cn';

const FEATURES = [
  'Students track deadlines and confirm submissions in two steps',
  'Professors create assignments with a Google Drive submission link',
  'Live per-student progress bars for every assignment',
];

const ROLE_TABS = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'admin', label: 'Professor', icon: ShieldCheck },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PreviewCard() {
  const rows = [
    ['Aarav Patel', 86],
    ['Diya Sharma', 100],
    ['Kabir Mehta', 57],
  ];
  return (
    <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Class progress</p>
        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-100">Live</span>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map(([name, pct]) => (
          <li key={name}>
            <div className="mb-1 flex justify-between text-xs text-indigo-100">
              <span>{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const INPUT =
  'block h-11 w-full rounded-xl bg-white pl-10 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-inset transition placeholder:text-slate-400 focus:ring-2';

function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      {formError && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            aria-invalid={Boolean(errors.email)}
            className={cn(INPUT, 'pr-3', errors.email ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-200 focus:ring-indigo-500')}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className={cn(INPUT, 'pr-11', errors.password ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-200 focus:ring-indigo-500')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password}</p>}
      </div>

      <Button type="submit" size="lg" icon={LogIn} loading={busy} className="w-full">
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

function DemoAccounts() {
  const { users, signIn } = useAuth();
  const [role, setRole] = useState('student');
  const [pendingId, setPendingId] = useState(null);
  const accounts = users.filter((u) => u.role === role);

  async function quickSignIn(account) {
    setPendingId(account.id);
    try {
      // Goes through the same credential check as the form.
      await signIn(account.email, DEMO_PASSWORD);
    } catch {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="my-7 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or try a demo account
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Tabs tabs={ROLE_TABS} value={role} onChange={setRole} label="Demo account type" className="w-full [&>button]:flex-1" />

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {accounts.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              onClick={() => quickSignIn(account)}
              disabled={pendingId !== null}
              className="group flex h-full w-full items-center gap-3 rounded-xl bg-white p-2.5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-70"
            >
              <Avatar name={account.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-semibold text-slate-900">{account.name}</span>
                <span className="block break-words text-xs text-slate-500">
                  {account.role === 'admin' ? account.department : account.rollNo}
                </span>
              </span>
              {pendingId === account.id && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-500" />}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-slate-500">
        All demo accounts use the password{' '}
        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-700">{DEMO_PASSWORD}</code>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />

        <Logo light className="relative" />

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Assignment & review dashboard
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Every assignment, submission and deadline in one place.
          </h1>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-indigo-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative max-w-sm">
          <PreviewCard />
        </div>
      </aside>

      {/* Sign-in panel */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <Logo className="mb-8 lg:hidden" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in with your college email. You will only see your own data.</p>

          <SignInForm />
          <DemoAccounts />

          <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
            <strong className="font-semibold text-slate-700">Tip:</strong> open a student and a professor in two browser tabs. A
            submission in one tab appears live in the other.
          </p>
        </div>
      </main>
    </div>
  );
}
