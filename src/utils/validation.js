const DRIVE_HOSTS = ['drive.google.com', 'docs.google.com'];

export function isDriveLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && DRIVE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Validates assignment input. Shared by the form (instant feedback)
 * and the mock API (server-side style guard).
 * @returns {Record<string, string>} field -> error message (empty when valid)
 */
export function validateAssignment(values, { isNew = true } = {}) {
  const errors = {};
  const title = values.title?.trim() ?? '';

  if (title.length < 3) errors.title = 'Give the assignment a title (at least 3 characters).';
  else if (title.length > 120) errors.title = 'Keep the title under 120 characters.';

  if (!values.subject?.trim()) errors.subject = 'Subject is required.';

  if (!values.dueDate || Number.isNaN(new Date(values.dueDate).getTime())) {
    errors.dueDate = 'Pick a due date.';
  } else if (isNew && new Date(values.dueDate).getTime() < Date.now()) {
    errors.dueDate = 'The due date must be in the future.';
  }

  const link = values.driveLink?.trim() ?? '';
  if (!link) errors.driveLink = 'Attach the Google Drive link where students will submit.';
  else if (!isDriveLink(link)) errors.driveLink = 'Use a valid https://drive.google.com or docs.google.com link.';

  if (!values.assignedTo?.length) errors.assignedTo = 'Assign it to at least one student.';

  return errors;
}
