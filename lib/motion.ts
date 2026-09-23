import type { CSSProperties } from 'react';

/** Stagger index for `.reveal-item` / `.bar-grow` (see globals.css). Safe to call from server components. */
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties;
