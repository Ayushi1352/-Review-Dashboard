/**
 * Seed data for the mock backend.
 * Dates are generated relative to "now" so the demo always looks realistic
 * (some assignments due soon, some overdue, some upcoming).
 */

/** ISO timestamp `days` from today at the given local time. */
function at(days, hours = 23, minutes = 59) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const professors = [
  { id: 'p-1', role: 'admin', name: 'Dr. Neha Verma', email: 'neha.verma@faculty.edu', department: 'Computer Science' },
  { id: 'p-2', role: 'admin', name: 'Prof. Arjun Menon', email: 'arjun.menon@faculty.edu', department: 'Mathematics' },
];

const students = [
  { id: 's-1', role: 'student', name: 'Aarav Patel', email: 'aarav.patel@student.edu', rollNo: 'CS-2023-014' },
  { id: 's-2', role: 'student', name: 'Diya Sharma', email: 'diya.sharma@student.edu', rollNo: 'CS-2023-021' },
  { id: 's-3', role: 'student', name: 'Kabir Mehta', email: 'kabir.mehta@student.edu', rollNo: 'CS-2023-033' },
  { id: 's-4', role: 'student', name: 'Ishita Rao', email: 'ishita.rao@student.edu', rollNo: 'CS-2023-038' },
  { id: 's-5', role: 'student', name: 'Rohan Das', email: 'rohan.das@student.edu', rollNo: 'CS-2023-042' },
  { id: 's-6', role: 'student', name: 'Meera Nair', email: 'meera.nair@student.edu', rollNo: 'CS-2023-047' },
  { id: 's-7', role: 'student', name: 'Vivaan Kapoor', email: 'vivaan.kapoor@student.edu', rollNo: 'CS-2023-055' },
  { id: 's-8', role: 'student', name: 'Ananya Iyer', email: 'ananya.iyer@student.edu', rollNo: 'CS-2023-061' },
];

const ALL = students.map((s) => s.id);

/**
 * Demo password for every account. This is a mock: there is no backend, so
 * credentials live in the seed data. A real app would verify hashed
 * passwords on a server.
 */
export const DEMO_PASSWORD = 'demo123';

/**
 * Seed assignments point to Google Drive itself, because made-up folder ids
 * would return a 404. Professors paste their real folder link when they
 * create or edit an assignment.
 */
const DEMO_DRIVE_LINK = 'https://drive.google.com/drive/my-drive';

export function createSeedDatabase() {
  return {
    users: [...professors, ...students].map((u) => ({ ...u, password: DEMO_PASSWORD })),
    assignments: [
      {
        id: 'a-101',
        title: 'Binary Search Tree Implementation',
        subject: 'Data Structures',
        description:
          'Implement a BST with insert, delete and in-order traversal. Include time-complexity analysis and at least 10 unit tests.',
        dueDate: at(5),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-1',
        createdAt: at(-6, 10, 0),
        assignedTo: ALL,
      },
      {
        id: 'a-102',
        title: 'Graph Traversal Problem Set',
        subject: 'Algorithms',
        description: 'Solve the 6 BFS/DFS problems from the handout. Upload a single PDF with explanations and code snippets.',
        dueDate: at(1),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-1',
        createdAt: at(-8, 9, 30),
        assignedTo: ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6'],
      },
      {
        id: 'a-103',
        title: 'Database Normalization Case Study',
        subject: 'DBMS',
        description: 'Normalize the provided library schema up to BCNF and justify every decomposition step with functional dependencies.',
        dueDate: at(-2),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-1',
        createdAt: at(-14, 11, 0),
        assignedTo: ALL,
      },
      {
        id: 'a-104',
        title: 'React Portfolio Mini-Project',
        subject: 'Web Development',
        description: 'Build a responsive personal portfolio with React and Tailwind. Share the repository link and a deployed URL in a doc.',
        dueDate: at(12),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-1',
        createdAt: at(-2, 16, 0),
        assignedTo: ['s-1', 's-2', 's-3', 's-7', 's-8'],
      },
      {
        id: 'a-105',
        title: 'Process Scheduling Lab Report',
        subject: 'Operating Systems',
        description: 'Simulate FCFS, SJF and Round Robin scheduling. Compare average waiting and turnaround time with charts.',
        dueDate: at(-1),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-1',
        createdAt: at(-10, 12, 0),
        assignedTo: ['s-1', 's-4', 's-5', 's-8'],
      },
      {
        id: 'a-201',
        title: 'Linear Algebra Worksheet 3',
        subject: 'Mathematics',
        description: 'Eigenvalues, eigenvectors and diagonalization. Show all working; scanned handwritten solutions are fine.',
        dueDate: at(3),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-2',
        createdAt: at(-5, 9, 0),
        assignedTo: ALL,
      },
      {
        id: 'a-202',
        title: 'Probability Distributions Reflection',
        subject: 'Statistics',
        description: 'A 500-word reflection on where binomial and Poisson distributions show up in real engineering problems.',
        dueDate: at(-4),
        driveLink: DEMO_DRIVE_LINK,
        createdBy: 'p-2',
        createdAt: at(-12, 10, 0),
        assignedTo: ['s-1', 's-2', 's-3', 's-4', 's-5'],
      },
    ],
    // submissions[assignmentId][studentId] = ISO timestamp of the confirmed submission
    submissions: {
      'a-101': { 's-1': at(-1, 14, 20), 's-3': at(-2, 18, 40), 's-5': at(-1, 21, 5), 's-6': at(-1, 11, 12) },
      'a-102': { 's-2': at(-1, 20, 15), 's-4': at(0, 0, 45), 's-6': at(-2, 17, 30) },
      'a-103': {
        's-1': at(-4, 19, 0),
        's-2': at(-3, 22, 10),
        's-3': at(-1, 10, 25), // submitted after the deadline -> late
        's-4': at(-5, 16, 0),
        's-6': at(-2, 18, 0),
        's-7': at(-3, 13, 45),
      },
      'a-104': { 's-7': at(-1, 23, 10) },
      'a-105': { 's-4': at(-2, 15, 30) },
      'a-201': { 's-2': at(-1, 12, 0), 's-3': at(-1, 8, 30), 's-8': at(-2, 19, 50) },
      'a-202': { 's-1': at(-6, 18, 0), 's-2': at(-5, 20, 0), 's-4': at(-4, 20, 0), 's-5': at(-3, 9, 15) },
    },
  };
}
