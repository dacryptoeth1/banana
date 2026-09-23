'use client';
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/lib/format';

/* ------------------------- Shared viewport observer ------------------------ */
/* One IntersectionObserver for every Reveal / CountUp on the page. */
const callbacks = new WeakMap<Element, () => void>();
let io: IntersectionObserver | undefined;

/** Calls `onEnter` once, the first time `el` scrolls into view. Returns a cleanup. */
export function whenVisible(el: Element, onEnter: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    onEnter();
    return () => {};
  }
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        callbacks.get(e.target)?.();
        callbacks.delete(e.target);
        io!.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  callbacks.set(el, onEnter);
  io.observe(el);
  return () => {
    callbacks.delete(el);
    io?.unobserve(el);
  };
}

/* --------------------------- prefers-reduced-motion ------------------------ */
const RM = '(prefers-reduced-motion: reduce)';
const subscribeRM = (cb: () => void) => {
  const m = matchMedia(RM);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
/** True on the server, so motion-only markup is added after hydration. */
export const useReducedMotion = () => useSyncExternalStore(subscribeRM, () => matchMedia(RM).matches, () => true);

/* --------------------------------- Reveal --------------------------------- */
/**
 * Marks a block for scroll reveal. Children opt in with `.reveal-item` (and `stagger(i)`);
 * the CSS in globals.css does the rest. Without JS or with reduced motion, nothing is hidden.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenVisible(el, () => el.setAttribute('data-shown', ''));
  }, []);
  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}

/* --------------------------------- CountUp -------------------------------- */
/** Renders the real value on the server; counts up from 0 the first time it scrolls into view. */
export function CountUp({ value, prefix = '', className }: { value: number; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia(RM).matches) return;
    const fmt = (n: number) => prefix + Math.round(n).toLocaleString('en-US');
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) return; // already on screen: don't flash back to 0
    el.textContent = fmt(0);
    let raf = 0;
    const stop = whenVisible(el, () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        el.textContent = fmt(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      el.textContent = fmt(value);
    };
  }, [value, prefix]);
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix + value.toLocaleString('en-US')}
    </span>
  );
}
