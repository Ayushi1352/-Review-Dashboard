import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DeleteAssignmentModal({ assignment, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submissionCount = Object.keys(assignment.submissions).length;

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(assignment);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={busy ? undefined : onClose} labelledBy="delete-title" size="sm">
      <div className="p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <Trash2 className="h-6 w-6" />
        </span>
        <h2 id="delete-title" className="mt-4 text-xl font-bold text-slate-900">
          Delete this assignment?
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          <strong className="font-semibold text-slate-800">{assignment.title}</strong> will be removed for all students
          {submissionCount > 0 && (
            <>
              , along with <strong className="font-semibold text-slate-800">{submissionCount} submission record{submissionCount === 1 ? '' : 's'}</strong>
            </>
          )}
          . This cannot be undone.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" icon={Trash2} loading={busy} onClick={handleDelete}>
            Delete assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
