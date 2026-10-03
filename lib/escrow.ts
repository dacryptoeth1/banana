import type { Product } from './mock-data';
import type { ChainInfo } from './chain';

/* Escrow for Creator Services. The words people see; the chain stays in the basement. */

export const isEscrowed = (p: Pick<Product, 'category'>) => p.category === 'Services';

export const ESCROW_STEPS = ['Payment held safely', 'Delivered', 'Paid to creator'] as const;

export type EscrowAction = 'hold' | 'release' | 'refund';
export type EscrowResult = { ok: true; mode: 'mock' | 'testnet'; tx: ChainInfo } | { ok: false; error: string };

/** Ask the server to hold / release / refund. Never throws: the UI shows a calm retry instead. */
export async function escrowCall(action: EscrowAction, body: { saleId: string; heldAt: number; seller: string; amountUsd: number }): Promise<EscrowResult> {
  try {
    const res = await fetch('/api/escrow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...body }) });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.ok) return { ok: false, error: j?.error ?? 'That didn’t go through. Please try again.' };
    return j as EscrowResult;
  } catch {
    return { ok: false, error: 'You seem to be offline. Please try again.' };
  }
}
