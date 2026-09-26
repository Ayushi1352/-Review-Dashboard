import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useStorageSync } from './useStorageSync';

/** Loads and mutates the signed-in student's own assignments. */
export function useStudentAssignments(studentId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getStudentAssignments(studentId);
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  useStorageSync(load);

  const retry = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  const submit = useCallback(
    async (assignmentId) => {
      const { submittedAt } = await api.submitAssignment(studentId, assignmentId);
      setAssignments((list) => list.map((a) => (a.id === assignmentId ? { ...a, submittedAt } : a)));
      return submittedAt;
    },
    [studentId],
  );

  return { assignments, loading, error, retry, submit };
}
