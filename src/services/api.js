/**
 * Mock REST-like API backed by localStorage.
 *
 * Every call is async with artificial latency so the UI handles loading
 * states exactly as it would with a real backend. Authorization and data
 * scoping live HERE, not in the UI: a student can only read their own
 * assignments, and a professor can only read and manage the assignments
 * they created.
 */
import { createSeedDatabase } from '../data/seed';
import { validateAssignment } from '../utils/validation';

// Bump the version whenever the seed shape changes so browsers load fresh data.
export const DB_KEY = 'assignly:db:v2';
const LATENCY_MS = 350;

const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function writeDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked (private mode): keep working in memory for this call.
  }
}

function readDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted or unavailable storage: fall back to fresh seed data.
  }
  const db = createSeedDatabase();
  writeDb(db);
  return db;
}

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function assertRole(db, userId, role) {
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.role !== role) throw new ApiError('You are not allowed to perform this action.', 403);
  return user;
}

function assertOwnedAssignment(db, adminId, assignmentId) {
  const assignment = db.assignments.find((a) => a.id === assignmentId);
  if (!assignment) throw new ApiError('Assignment not found.', 404);
  if (assignment.createdBy !== adminId) throw new ApiError('You can only manage assignments you created.', 403);
  return assignment;
}

function sanitizeInput(db, input, isNew) {
  const errors = validateAssignment(input, { isNew });
  const firstError = Object.values(errors)[0];
  if (firstError) throw new ApiError(firstError, 422);

  const studentIds = new Set(db.users.filter((u) => u.role === 'student').map((u) => u.id));
  return {
    title: input.title.trim(),
    subject: input.subject.trim(),
    description: input.description?.trim() ?? '',
    dueDate: new Date(input.dueDate).toISOString(),
    driveLink: input.driveLink.trim(),
    assignedTo: [...new Set(input.assignedTo)].filter((id) => studentIds.has(id)),
  };
}

const toAdminView = (db, assignment) => ({
  ...assignment,
  submissions: { ...(db.submissions[assignment.id] ?? {}) },
});

const publicUser = ({ id, role, name, email, department, rollNo }) => ({ id, role, name, email, department, rollNo });

export const api = {
  /** Demo accounts shown on the sign-in screen. */
  async getUsers() {
    await wait(150);
    return readDb().users.map(publicUser);
  },

  /** Email + password sign-in. Same error for unknown email and wrong password. */
  async login(email, password) {
    await wait(500);
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) throw new ApiError('Incorrect email or password.', 401);
    return publicUser(user);
  },

  /* ----------------------------- Student ----------------------------- */

  /** Only the assignments assigned to this student, with only THEIR submission. */
  async getStudentAssignments(studentId) {
    await wait();
    const db = readDb();
    assertRole(db, studentId, 'student');
    const professors = new Map(db.users.filter((u) => u.role === 'admin').map((u) => [u.id, u]));

    return db.assignments
      .filter((a) => a.assignedTo.includes(studentId))
      // eslint-disable-next-line no-unused-vars
      .map(({ assignedTo, ...a }) => {
        const prof = professors.get(a.createdBy);
        return {
          ...a,
          professor: prof ? { id: prof.id, name: prof.name, department: prof.department } : null,
          submittedAt: db.submissions[a.id]?.[studentId] ?? null,
        };
      });
  },

  async submitAssignment(studentId, assignmentId) {
    await wait(650);
    const db = readDb();
    assertRole(db, studentId, 'student');
    const assignment = db.assignments.find((a) => a.id === assignmentId);
    if (!assignment || !assignment.assignedTo.includes(studentId)) {
      throw new ApiError('This assignment is not assigned to you.', 404);
    }
    if (db.submissions[assignmentId]?.[studentId]) {
      throw new ApiError('You have already confirmed this submission.', 409);
    }
    const submittedAt = new Date().toISOString();
    db.submissions[assignmentId] = { ...(db.submissions[assignmentId] ?? {}), [studentId]: submittedAt };
    writeDb(db);
    return { assignmentId, submittedAt };
  },

  /* ------------------------------ Admin ------------------------------ */

  /** Only the assignments this professor created, plus the student roster. */
  async getAdminDashboard(adminId) {
    await wait();
    const db = readDb();
    assertRole(db, adminId, 'admin');
    return {
      assignments: db.assignments.filter((a) => a.createdBy === adminId).map((a) => toAdminView(db, a)),
      students: db.users.filter((u) => u.role === 'student').map(publicUser),
    };
  },

  async createAssignment(adminId, input) {
    await wait();
    const db = readDb();
    assertRole(db, adminId, 'admin');
    const assignment = {
      id: newId('a'),
      ...sanitizeInput(db, input, true),
      createdBy: adminId,
      createdAt: new Date().toISOString(),
    };
    db.assignments.unshift(assignment);
    writeDb(db);
    return toAdminView(db, assignment);
  },

  async updateAssignment(adminId, assignmentId, input) {
    await wait();
    const db = readDb();
    assertRole(db, adminId, 'admin');
    const existing = assertOwnedAssignment(db, adminId, assignmentId);
    const updated = { ...existing, ...sanitizeInput(db, input, false), updatedAt: new Date().toISOString() };

    db.assignments = db.assignments.map((a) => (a.id === assignmentId ? updated : a));
    // Drop submission records of students who were un-assigned.
    const subs = db.submissions[assignmentId] ?? {};
    db.submissions[assignmentId] = Object.fromEntries(
      Object.entries(subs).filter(([studentId]) => updated.assignedTo.includes(studentId)),
    );
    writeDb(db);
    return toAdminView(db, updated);
  },

  async deleteAssignment(adminId, assignmentId) {
    await wait();
    const db = readDb();
    assertRole(db, adminId, 'admin');
    assertOwnedAssignment(db, adminId, assignmentId);
    db.assignments = db.assignments.filter((a) => a.id !== assignmentId);
    delete db.submissions[assignmentId];
    writeDb(db);
    return { id: assignmentId };
  },

  /* ------------------------------ Demo ------------------------------- */

  resetDemo() {
    localStorage.removeItem(DB_KEY);
  },
};
