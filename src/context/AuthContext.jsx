import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const SESSION_KEY = 'assignly:session';
const AuthContext = createContext(null);

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Simulated authentication. The "session" is just the signed-in user id in
 * localStorage; the mock API re-checks the role on every request.
 */
export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(readSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api.getUsers().then((list) => {
      if (!active) return;
      setUsers(list);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback((id) => {
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      /* session will only last for this tab */
    }
    setUserId(id);
  }, []);

  /** Email + password sign-in. Throws ApiError on bad credentials. */
  const signIn = useCallback(
    async (email, password) => {
      const user = await api.login(email, password);
      login(user.id);
      return user;
    },
    [login],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUserId(null);
  }, []);

  const resetDemo = useCallback(() => {
    api.resetDemo();
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      users,
      ready,
      user: users.find((u) => u.id === userId) ?? null,
      login,
      signIn,
      logout,
      resetDemo,
    }),
    [users, ready, userId, login, signIn, logout, resetDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
