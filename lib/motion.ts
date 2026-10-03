import type { CSSProperties } from 'react';

/** Stagger index for `.reveal-item` / `.bar-grow` (see globals.css). Safe to call from server components. */
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties;

/* Framer Motion presets. Durations stay within 200–600ms; interactive things use springs. */
export const spring = { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 } as const;
export const softSpring = { type: 'spring', stiffness: 260, damping: 26 } as const;
export const easeOut = [0.2, 0.7, 0.2, 1] as const;
