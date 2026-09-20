/**
 * demo (default): everything lives in localStorage, no accounts, Demo menu + Reset demo.
 * live: real sign-in (email code via Resend) via next-auth. localStorage still holds the app state.
 * NEXT_PUBLIC_ is inlined at build time, so changing the mode needs a rebuild/redeploy.
 */
export const MODE: 'demo' | 'live' = process.env.NEXT_PUBLIC_BANANA_MODE === 'live' ? 'live' : 'demo';
export const isLive = MODE === 'live';
