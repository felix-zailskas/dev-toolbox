import { useState, useCallback } from "react";

export function useSessionState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = sessionStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  const setSessionState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        sessionStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key]
  );

  return [state, setSessionState];
}
