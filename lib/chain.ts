import type { CountryCode } from './mock-data';

/*
 * The basement. Only receipts' "onchain" side reads from here; nothing on the buyer path does.
 * Demo mode derives realistic-looking details from the sale's reference; testnet mode stores the real ones.
 */

export type ChainInfo = {
  hash: string;
  block: number;
  /** When the settlement landed onchain (ms epoch). */
  settledAt: number;
  /** True when the details are illustrative (demo mode), not a real transaction. */
  sample: boolean;
};

export const NETWORK = 'Monad testnet';
// MonadScan (Etherscan-style: /tx/<hash>). Backup: https://testnet.monadvision.com
export const EXPLORER = (process.env.NEXT_PUBLIC_MONAD_EXPLORER || 'https://testnet.monadscan.com').replace(/\/$/, '');
export const explorerTx = (hash: string) => `${EXPLORER}/tx/${hash}`;

/** The city we name on receipts, per buyer country. */
export const CITY: Record<CountryCode, string> = { NG: 'Lagos', GH: 'Accra', KE: 'Nairobi', ZA: 'Johannesburg' };

// Monad produces a block about every 0.4s. Anchor a plausible height so sample blocks look like real ones.
const ANCHOR = { at: Date.UTC(2026, 0, 1), block: 41_250_000 };

/** Deterministic sample details for a demo sale: same reference, same receipt, every time it's opened. */
export function sampleChain(ref: string, at: number): ChainInfo {
  const n = parseInt(ref.slice(2, 10), 16) || 0;
  const block = ANCHOR.block + Math.max(0, Math.floor((at - ANCHOR.at) / 400)) + 2 + (n % 3);
  const settledAt = at + 600 + (n % 900); // 0.6–1.5s after the buyer paid
  return { hash: ref, block, settledAt, sample: true };
}

export const shortTx = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;
