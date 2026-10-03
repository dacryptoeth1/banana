'use client';
import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/**
 * Counts up from 0 on mount, then from the old value to the new one whenever `value` changes.
 * Writes textContent directly, so React does not re-render on every frame.
 */
export function AnimatedNumber({ value, format, className, duration = 0.6 }: { value: number; format: (n: number) => string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const fmt = useRef(format);
  fmt.current = format;
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { el.textContent = fmt.current(value); from.current = value; return; }
    const a = animate(from.current, value, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (n) => { from.current = n; el.textContent = fmt.current(n); },
    });
    // Interrupted (new value, or a dev double-mount): the next run continues from where this one stopped.
    return () => a.stop();
  }, [value, duration, reduced]);

  return <span ref={ref} className={`tabular-nums ${className ?? ''}`}>{format(value)}</span>;
}
