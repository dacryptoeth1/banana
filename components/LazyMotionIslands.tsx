'use client';
import dynamic from 'next/dynamic';

/*
 * Motion islands that are below the fold or appear after a delay. Loaded on the client after
 * hydration, so their Framer Motion code never competes with first paint.
 */
export const SaleJourney = dynamic(() => import('./SaleJourney').then((m) => m.SaleJourney), {
  ssr: false,
  loading: () => <div className="min-h-[520px]" aria-hidden />,
});
export const SaleToasts = dynamic(() => import('./SaleToasts').then((m) => m.SaleToasts), { ssr: false });
