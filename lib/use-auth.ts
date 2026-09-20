'use client';
import { useSession } from 'next-auth/react';
import { isLive } from './mode';

const demoAuth = { data: null, status: 'unauthenticated' as const, update: async (..._args: unknown[]) => null };

/** useSession() in live mode; an always-signed-out stub in demo mode (where there is no SessionProvider). isLive is fixed per build, so the hook order never changes. */
export const useAuth: () => Pick<ReturnType<typeof useSession>, 'data' | 'status' | 'update'> = isLive ? useSession : () => demoAuth;
