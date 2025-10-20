import { useRef, useCallback } from 'react';

export const useTimer = () => {
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const setTimeoutTimer = useCallback((key: string, callback: () => void, delay: number) => {
    // Clear existing timer with the same key
    if (timersRef.current.has(key)) {
      clearTimeout(timersRef.current.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback();
      timersRef.current.delete(key);
    }, delay);

    timersRef.current.set(key, timer);
  }, []);

  const clearTimer = useCallback((key: string) => {
    if (timersRef.current.has(key)) {
      clearTimeout(timersRef.current.get(key)!);
      timersRef.current.delete(key);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  return { setTimeoutTimer, clearTimer, clearAllTimers };
};
