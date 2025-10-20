'use client';

import { useEffect } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;

type ShortcutMap = Record<string, ShortcutHandler>;

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

const resolveKey = (event: KeyboardEvent) => {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.metaKey) parts.push('meta');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  parts.push(event.key.toLowerCase());
  return parts.join('+');
};

export const useShortcut = (mapping: ShortcutMap) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = resolveKey(event);
      const macKey = isMac ? key.replace(/^ctrl/, 'meta') : key;
      const callback = mapping[macKey] ?? mapping[key];
      if (callback) {
        callback(event);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mapping]);
};

export default useShortcut;
