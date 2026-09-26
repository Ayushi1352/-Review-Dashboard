import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useStorageSync } from './useStorageSync';

/** Loads the professor's own assignments + student roster, and exposes CRUD actions. */
export function useAdminDashboard(adminId) {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getAdminDashboard(adminId);
      setAssignments(data.assignments);
      setStudents(data.students);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    load();
  }, [load]);

  useStorageSync(load);

  const retry = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  const createAssignment = useCallback(
    async (input) => {
      const created = await api.createAssignment(adminId, input);
      setAssignments((list) => [created, ...list]);
      return created;
    },
    [adminId],
  );

  const updateAssignment = useCallback(
    async (id, input) => {
      const updated = await api.updateAssignment(adminId, id, input);
      setAssignments((list) => list.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [adminId],
  );

  const deleteAssignment = useCallback(
    async (id) => {
      await api.deleteAssignment(adminId, id);
      setAssignments((list) => list.filter((a) => a.id !== id));
    },
    [adminId],
  );

  return { assignments, students, loading, error, retry, createAssignment, updateAssignment, deleteAssignment };
}
