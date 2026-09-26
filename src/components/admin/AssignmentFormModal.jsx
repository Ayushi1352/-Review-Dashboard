import { useMemo, useState } from 'react';
import { Check, FolderOpen, Link2, Plus, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/cn';
import { fromDateInput, toDateInput } from '../../utils/date';
import { isDriveLink, validateAssignment } from '../../utils/validation';

const INPUT =
  'block w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-inset transition placeholder:text-slate-400 focus:ring-2';

function inputClass(error) {
  return cn(INPUT, error ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-200 focus:ring-indigo-500');
}

function Field({ id, label, hint, error, children, className }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function initialValues(assignment, students) {
  if (assignment) {
    return {
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description ?? '',
      dueDate: toDateInput(assignment.dueDate),
      driveLink: assignment.driveLink,
      assignedTo: [...assignment.assignedTo],
    };
  }
  return { title: '', subject: '', description: '', dueDate: '', driveLink: '', assignedTo: students.map((s) => s.id) };
}

/** Create or edit an assignment. `assignment` = null for create mode. */
export default function AssignmentFormModal({ assignment, students, subjects, onClose, onSave }) {
  const isEdit = Boolean(assignment);
  const [values, setValues] = useState(() => initialValues(assignment, students));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const today = useMemo(() => toDateInput(new Date().toISOString()), []);

  const toPayload = (v) => ({ ...v, dueDate: v.dueDate ? fromDateInput(v.dueDate) : '' });

  function update(field, value) {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first submit attempt, re-validate live so errors clear as the user fixes them.
    if (submitted) setErrors(validateAssignment(toPayload(next), { isNew: !isEdit }));
  }

  function toggleStudent(id) {
    update('assignedTo', values.assignedTo.includes(id) ? values.assignedTo.filter((s) => s !== id) : [...values.assignedTo, id]);
  }

  const allSelected = values.assignedTo.length === students.length;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    const payload = toPayload(values);
    const nextErrors = validateAssignment(payload, { isNew: !isEdit });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setServerError(null);
    try {
      await onSave(payload);
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  const linkLooksValid = values.driveLink && isDriveLink(values.driveLink.trim());

  return (
    <Modal onClose={saving ? undefined : onClose} labelledBy="assignment-form-title" size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <div className="border-b border-slate-100 px-6 pb-5 pt-6 pr-16 sm:px-8 sm:pt-8">
          <h2 id="assignment-form-title" className="text-xl font-bold text-slate-900">
            {isEdit ? 'Edit assignment' : 'Create a new assignment'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Students submit their work to the Drive link, then confirm the submission here.
          </p>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <Field id="title" label="Title" error={errors.title} className="sm:col-span-2">
            <input
              id="title"
              value={values.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Binary Search Tree Implementation"
              className={inputClass(errors.title)}
              aria-invalid={Boolean(errors.title)}
              autoFocus
            />
          </Field>

          <Field id="subject" label="Subject" error={errors.subject}>
            <input
              id="subject"
              list="subject-options"
              value={values.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="e.g. Data Structures"
              className={inputClass(errors.subject)}
              aria-invalid={Boolean(errors.subject)}
            />
            <datalist id="subject-options">
              {subjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <Field id="dueDate" label="Due date" hint="Due at 11:59 PM on this day." error={errors.dueDate}>
            <input
              id="dueDate"
              type="date"
              min={isEdit ? undefined : today}
              value={values.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              className={inputClass(errors.dueDate)}
              aria-invalid={Boolean(errors.dueDate)}
            />
          </Field>

          <Field id="description" label="Instructions" hint="Optional. What should students hand in?" className="sm:col-span-2">
            <textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the task, format and grading criteria…"
              className={cn(inputClass(false), 'resize-none')}
            />
          </Field>

          <Field
            id="driveLink"
            label="Google Drive submission link"
            hint="Folder or document where students upload their work."
            error={errors.driveLink}
            className="sm:col-span-2"
          >
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="driveLink"
                type="url"
                inputMode="url"
                value={values.driveLink}
                onChange={(e) => update('driveLink', e.target.value)}
                placeholder="https://drive.google.com/drive/folders/…"
                className={cn(inputClass(errors.driveLink), 'pl-10 pr-10')}
                aria-invalid={Boolean(errors.driveLink)}
              />
              {linkLooksValid && (
                <Check className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" aria-label="Valid Drive link" />
              )}
            </div>
            {linkLooksValid && (
              <a
                href={values.driveLink.trim()}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                <FolderOpen className="h-3.5 w-3.5" /> Test link
              </a>
            )}
          </Field>

          <fieldset className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <legend className="text-sm font-medium text-slate-700">
                Assign to <span className="font-normal text-slate-400">({values.assignedTo.length} of {students.length})</span>
              </legend>
              <button
                type="button"
                onClick={() => update('assignedTo', allSelected ? [] : students.map((s) => s.id))}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div
              className={cn(
                'grid max-h-56 gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-2 ring-1 ring-inset sm:grid-cols-2',
                errors.assignedTo ? 'ring-rose-300' : 'ring-slate-200/70',
              )}
            >
              {students.map((student) => {
                const checked = values.assignedTo.includes(student.id);
                return (
                  <label
                    key={student.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ring-1 transition',
                      checked ? 'bg-white shadow-sm ring-indigo-200' : 'ring-transparent hover:bg-white',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(student.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                    />
                    <Avatar name={student.name} size="xs" />
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-medium text-slate-800">{student.name}</span>
                      <span className="block break-words text-xs text-slate-500">{student.rollNo}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.assignedTo && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                {errors.assignedTo}
              </p>
            )}
            {isEdit && (
              <p className="mt-1.5 text-xs text-slate-500">Removing a student also removes their submission record.</p>
            )}
          </fieldset>

          {serverError && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200 sm:col-span-2">
              {serverError}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-8">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" icon={isEdit ? Save : Plus} loading={saving}>
            {isEdit ? 'Save changes' : 'Create assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
