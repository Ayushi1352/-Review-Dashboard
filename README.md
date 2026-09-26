# Assignly: Assignment & Review Dashboard

A responsive, role-based dashboard for managing student assignments, built with **React 19, Vite and Tailwind CSS v4**.
There is no backend. Data comes from a mock API that stores everything in `localStorage` and adds realistic network latency.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

Sign in with an email and password, or click any account under **Try a demo account**. Every account uses the password `demo123`. Use **Reset demo data** in the user menu to restore the original data.

| Role | Email | Password |
| --- | --- | --- |
| Professor | neha.verma@faculty.edu | demo123 |
| Professor | arjun.menon@faculty.edu | demo123 |
| Student | aarav.patel@student.edu | demo123 |
| Student | diya.sharma@student.edu | demo123 |

Six more student accounts are listed on the sign-in screen.

> **Try this:** open a student in one tab and their professor in another. When the student confirms a submission, the professor's progress bars update live through the browser `storage` event.

## Features

### Sign-in
- Email and password form with validation, a show/hide password toggle, a loading state and a clear error for wrong credentials.
- One-click demo accounts for students and professors. They go through the same credential check as the form.
- This is simulated authentication. Without a backend, credentials live in the mock data. A real app would check hashed passwords on a server.

### Student
- Personal hero with a completion ring, a smart headline and an "Up next" deadline.
- Summary cards for total, completed, pending and overdue work.
- Assignment cards with a subject chip, status badge, professor, due date and a direct **Open Drive** link.
- Filter tabs with counts (All / Pending / Overdue / Completed) and search.
- **Double-verification submission flow**
  1. *"Have you submitted your work?"* shows the Drive link and asks **"Yes, I have submitted"**.
  2. *"Final confirmation"* explains that the action cannot be undone and warns when the submission will be late.
  3. An animated success state and a toast confirm the submission.

### Professor (admin)
- Create, edit and delete assignments with a **Google Drive link**, a due date, instructions and a student picker.
- Validation for required fields, future due dates and `drive.google.com` / `docs.google.com` links.
- Every assignment card has a **segmented progress bar with one segment per student**. Green is on time, amber is late, red is missing and grey is pending. Hover a segment to see the student's name.
- An expandable roster per assignment shows each student's status, submission time and an individual bar.
- A **Student progress** tab gives each student an individual progress bar across this professor's assignments. It supports sorting by "needs attention" and search.
- Summary cards show submissions received vs. expected, completion rate and missing work.

### Data isolation
Scoping is enforced in the **API layer**, not only hidden in the UI.
- A student only receives assignments assigned to them, with their own submission only. Other students' ids are stripped out.
- A professor only receives, edits and deletes the assignments **they created**.
- The API rejects cross-role calls, double submissions and submissions to assignments that are not yours.

### UX details
- Fully responsive. Modals become bottom sheets on mobile, and professors get a floating "+" button.
- Loading skeletons, error state with retry, empty states and toast notifications.
- Accessible markup: ARIA roles for dialogs, tabs and progress bars, Escape to close, focus handling and `prefers-reduced-motion` support.
- Seed assignments link to Google Drive itself, since made-up folder ids would return a 404. Professors paste their real folder link when they create or edit an assignment.
- Seed dates are relative to today, so the demo always shows a realistic mix of upcoming, due-soon and overdue work.

## Project structure

```
src/
├── main.jsx                 # Providers + root render
├── App.jsx                  # Role-based routing (login / student / professor)
├── index.css                # Tailwind v4 theme, fonts, animations
├── data/seed.js             # Mock users, assignments and submissions
├── services/api.js          # Mock async API over localStorage (auth checks + scoping)
├── context/
│   ├── AuthContext.jsx      # Simulated session (login / logout / reset)
│   └── ToastContext.jsx     # Global toast notifications
├── hooks/
│   ├── useStudentAssignments.js
│   ├── useAdminDashboard.js
│   └── useStorageSync.js    # Live cross-tab updates
├── utils/                   # Dates, status rules, validation, colours, cn()
├── pages/
│   ├── LoginPage.jsx
│   ├── StudentDashboard.jsx
│   └── AdminDashboard.jsx
└── components/
    ├── layout/              # AppShell, Logo, UserMenu
    ├── ui/                  # Button, Modal, ProgressBar, ProgressRing, SegmentedProgress, Tabs, ...
    ├── student/             # StudentHero, AssignmentCard, SubmitConfirmModal
    └── admin/               # AdminHero, AdminAssignmentCard, AssignmentFormModal,
                             # DeleteAssignmentModal, StudentProgressList
```

## Design decisions
- **Custom hooks per role** keep pages declarative. Pages own UI state such as filters and open modals, while hooks own data and mutations.
- **Context API** is used only for truly global concerns, the session and toasts. Everything else stays local.
- **One validation function** (`utils/validation.js`) is shared by the form and the API, so rules never drift apart.
- **Status is derived, not stored.** "Overdue", "late" and "due soon" are computed from dates, so they are always correct.
- Swapping in a real backend only means changing `services/api.js`. The hooks and components stay the same.
