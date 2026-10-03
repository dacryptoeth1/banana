import { NextResponse } from 'next/server';
import { fakeHash } from '@/lib/format';
import { sampleChain } from '@/lib/chain';
import type { EscrowAction } from '@/lib/escrow';
import { EscrowError, escrowOnchain } from '@/lib/escrow-chain';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // a testnet transaction confirms in ~1s; leave room for RPC retries

const ACTIONS: EscrowAction[] = ['hold', 'release', 'refund'];
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/**
 * POST { action: 'hold' | 'release' | 'refund', saleId, heldAt, seller, amountUsd } → { ok, mode, tx }
 *
 * ESCROW_MODE=mock (default): no chain. Returns sample transaction details after a short, realistic pause,
 * so the demo never depends on a network. ESCROW_MODE=testnet: Banana's relayer sends the transaction on
 * Monad testnet (BananaEscrow.deposit / release / refund) and returns the real hash and block.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const action = body?.action as EscrowAction;
  if (!ACTIONS.includes(action)) return fail('Unknown action.', 400);
  if (typeof body?.saleId !== 'string' || !/^BNN-\d{4}$/.test(body.saleId)) return fail('Unknown order.', 400);
  if (typeof body?.seller !== 'string' || !/^[a-z0-9_-]{2,32}$/i.test(body.seller)) return fail('Unknown creator.', 400);
  if (!Number.isFinite(body?.heldAt) || !Number.isFinite(body?.amountUsd) || body.amountUsd <= 0 || body.amountUsd > 10_000) return fail('Invalid order.', 400);

  const mode = process.env.ESCROW_MODE === 'testnet' ? 'testnet' : 'mock';
  if (mode === 'testnet') {
    try {
      const tx = await escrowOnchain(action, { saleId: body.saleId, heldAt: body.heldAt, seller: String(body.seller ?? ''), amountUsd: body.amountUsd });
      return NextResponse.json({ ok: true, mode, tx });
    } catch (e) {
      if (e instanceof EscrowError) return NextResponse.json({ ok: false, error: e.message, ...e.extra }, { status: e.status });
      console.error('[escrow]', action, body.saleId, e instanceof Error ? e.message : e);
      return fail('Settlement is taking longer than usual. Please try again.', 502);
    }
  }

  await new Promise((r) => setTimeout(r, 450 + Math.random() * 500)); // feels like a real confirmation
  return NextResponse.json({ ok: true, mode, tx: sampleChain(fakeHash(), Date.now()) });
}
