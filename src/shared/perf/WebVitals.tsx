'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

const post = async (metric: Metric) => {
  try {
    await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        delta: (metric as any).delta,
        id: metric.id,
        navigationType: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type,
        url: typeof location !== 'undefined' ? location.pathname : ''
      })
    });
  } catch (_) {
    // no-op
  }
};

export default function WebVitals() {
  useEffect(() => {
    const report = (m: Metric) => post(m);
    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }, []);
  return null;
}

