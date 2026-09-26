import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import FullPageLoader from './components/ui/FullPageLoader';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return <FullPageLoader />;
  if (!user) return <LoginPage />;

  return (
    <AppShell>
      {/* key forces a clean remount (fresh state + fetch) when the account changes */}
      {user.role === 'admin' ? <AdminDashboard key={user.id} /> : <StudentDashboard key={user.id} />}
    </AppShell>
  );
}
