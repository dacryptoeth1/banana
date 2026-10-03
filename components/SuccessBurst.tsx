'use client';
import { m, useReducedMotion } from 'framer-motion';
import { spring } from '@/lib/motion';

const RAYS = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

/** Banana-yellow burst + a check that draws itself. ~600ms end to end. */
export function SuccessBurst({ size = 88 }: { size?: number }) {
  const reduced = useReducedMotion(); // reduced motion: just the badge, faded in by MotionConfig
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} aria-hidden>
      {/* rays fly out and fade */}
      {!reduced && RAYS.map((a, i) => (
        <m.span
          key={i}
          className="absolute left-1/2 top-1/2 -ml-[4px] -mt-[4px] h-2 w-2 rounded-full"
          style={{ background: i % 3 === 0 ? '#7C3AFF' : '#FFC93C' }}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
          animate={{ x: Math.cos(a) * size * 0.85, y: Math.sin(a) * size * 0.85, scale: [0.4, 1.2, 0.6], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
        />
      ))}
      {/* soft ring pulse */}
      {!reduced && <m.span className="absolute inset-0 rounded-full bg-gold/40" initial={{ scale: 0.6, opacity: 0.8 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ duration: 0.6, delay: 0.1 }} />}
      {/* the badge */}
      <m.div className="absolute inset-0 flex items-center justify-center rounded-full bg-gold shadow-[0_18px_40px_-12px_rgba(255,201,60,.9)]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
        <svg viewBox="0 0 24 24" width={size * 0.46} height={size * 0.46} fill="none" stroke="#1E1145" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <m.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }} />
        </svg>
      </m.div>
    </div>
  );
}
