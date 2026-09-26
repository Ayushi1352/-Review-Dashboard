import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ExternalLink, FileCheck2, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SubjectChip from '../ui/SubjectChip';
import { cn } from '../../utils/cn';
import { formatDate, formatDateTime, isPast } from '../../utils/date';

const STEPS = ['Verify upload', 'Final confirmation'];

function Stepper({ step }) {
  return (
    <ol className="flex gap-2 px-6 pt-6 pr-16 sm:px-8 sm:pt-8" aria-label="Submission steps">
      {STEPS.map((label, index) => {
        const current = index + 1;
        const active = step >= current;
        return (
          <li key={label} className="flex-1">
            <div className={cn('h-1.5 rounded-full transition-colors duration-300', active ? 'bg-indigo-600' : 'bg-slate-200')} />
            <p className={cn('mt-2 text-xs font-medium', active ? 'text-indigo-600' : 'text-slate-400')}>
              Step {current} · {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Double-verification submission flow:
 *   1. "Yes, I have submitted"  (did you really upload to Drive?)
 *   2. "Confirm submission"     (final, irreversible)
 *   3. Success state
 */
export default function SubmitConfirmModal({ assignment, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const late = isPast(assignment.dueDate);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      setSubmittedAt(await onConfirm(assignment));
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={busy ? undefined : onClose} labelledBy="submit-title">
      {step < 3 && <Stepper step={step} />}

      {step === 1 && (
        <div key="step-1" className="animate-fade-in p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileCheck2 className="h-6 w-6" />
          </span>
          <h2 id="submit-title" className="mt-4 text-xl font-bold text-slate-900">
            Have you submitted your work?
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Make sure your files are uploaded to the professor&apos;s Google Drive folder before marking this assignment as done.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <SubjectChip subject={assignment.subject} />
            <p className="mt-2 font-semibold text-slate-900">{assignment.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">Due {formatDate(assignment.dueDate)}</p>
            <a
              href={assignment.driveLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Open Drive folder <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Not yet
            </Button>
            <Button icon={Check} onClick={() => setStep(2)}>
              Yes, I have submitted
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div key="step-2" className="animate-fade-in p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h2 id="submit-title" className="mt-4 text-xl font-bold text-slate-900">
            Final confirmation
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            You&apos;re about to mark <strong className="font-semibold text-slate-800">{assignment.title}</strong> as submitted.
            Your professor will see it immediately.
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
            <li className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> My files are in the correct Drive folder.
            </li>
            <li className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> I understand this confirmation cannot be undone.
            </li>
          </ul>

          {late && (
            <p className="mt-4 flex gap-2.5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              The deadline has passed, so this will be recorded as a late submission.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)} disabled={busy}>
              Back
            </Button>
            <Button variant="success" icon={Check} loading={busy} onClick={handleConfirm}>
              {busy ? 'Confirming…' : 'Confirm submission'}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div key="step-3" className="flex flex-col items-center p-8 text-center sm:p-10">
          <span className="relative grid h-20 w-20 animate-pop place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30 [animation-iteration-count:2]" />
            <Check className="relative h-10 w-10" strokeWidth={3} />
          </span>
          <h2 id="submit-title" className="mt-6 text-xl font-bold text-slate-900">
            Submission recorded
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500">
            <strong className="font-semibold text-slate-800">{assignment.title}</strong> was marked as submitted on{' '}
            {formatDateTime(submittedAt)}. Nice work!
          </p>
          <Button onClick={onClose} className="mt-6 w-full sm:w-auto">
            Back to dashboard
          </Button>
        </div>
      )}
    </Modal>
  );
}
