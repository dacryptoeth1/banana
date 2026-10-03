'use client';
import { SessionProvider } from 'next-auth/react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { isLive } from '@/lib/mode';

/**
 * Framer Motion is loaded lean: `m.*` components, with the domAnimation feature set (no layout/drag)
 * fetched after first paint.
 * reducedMotion="user" turns transform animations into instant jumps when the OS asks for less motion.
 * Session context only exists in live mode; demo mode never talks to /api/auth.
 */
const loadFeatures = () => import('@/lib/motion-features').then((r) => r.default);

export function Providers({ children }: { children: ReactNode }) {
  const inner = (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
  return isLive ? <SessionProvider>{inner}</SessionProvider> : inner;
}
