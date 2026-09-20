'use client';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { isLive } from '@/lib/mode';

/** Session context only exists in live mode; demo mode never talks to /api/auth. */
export function Providers({ children }: { children: ReactNode }) {
  return isLive ? <SessionProvider>{children}</SessionProvider> : <>{children}</>;
}
