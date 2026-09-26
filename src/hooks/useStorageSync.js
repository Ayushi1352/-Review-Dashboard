import { useEffect, useRef } from 'react';
import { DB_KEY } from '../services/api';

/**
 * Calls `onChange` when the mock database changes in ANOTHER browser tab.
 * Open a student and a professor side by side: a submission in one tab
 * shows up live in the other, just like a real-time backend.
 */
export function useStorageSync(onChange) {
  const callbackRef = useRef(onChange);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === DB_KEY || event.key === null) callbackRef.current();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
}
