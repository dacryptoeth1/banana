import { NextResponse } from 'next/server';
import { fakeHash } from '@/lib/format';
import { sampleChain, type ChainInfo } from '@/lib/chain';
import { STORES } from '@/lib/mock-data';
import type { EscrowAction } from '@/lib/escrow';
import { EscrowError, escrowOnchain } from '@/lib/escrow-chain';
import { allow, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ACTIONS: EscrowAction[] = ['hold', 'release', 'refund'];
/** Most a single escrow may hold, in USDC. The priciest Creator Service is $50. */
const MAX_PER_ORDER = 100;
/** A testnet call slower than this completes in mock mode instead: the demo never stalls on stage. */
const TESTNET_BUDGET_MS = 8_000;
const KNOWN_CREATORS = new Set(STORES.map((s) => s.handle));

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });
const mockTx = (): ChainInfo => sampleChain(fakeHash(), Date.now());

/**
 * POST { action: 'hold' | 'release' | 'refund', saleId, heldAt, seller, amountUsd } → { ok, mode, tx }
 *
 * ESCROW_MODE=mock (default): no chain; sample transaction details after a short, realistic pause.
 * ESCROW_MODE=testnet: Banana's relayer sends the real transaction on Monad testnet. If that fails or
 * takes longer than 8s, the flow completes in mock mode (mode: 'mock-fallback') and the failure is logged.
 */
export async function POST(req: Request) {
  // Public demo: a speed bump per visitor, and a ceiling per server instance.
  const ip = clientIp(req);
  if (!allow(`ip:${ip}:m`, 6, 60_000) || !allow(`ip:${ip}:h`, 40, 3_600_000) || !allow('all:h', 300, 3_600_000)) {
    return fail('Too many requests. Please wait a minute and try again.', 429);
  }

  const body = await req.json().catch(() => null);
  const action = body?.action as EscrowAction;
  if (!ACTIONS.includes(action)) return fail('Unknown action.', 400);
  if (typeof body?.saleId !== 'string' || !/^BNN-\d{4}$/.test(body.saleId)) return fail('Unknown order.', 400);
  if (typeof body?.seller !== 'string' || !KNOWN_CREATORS.has(body.seller)) return fail('Unknown creator.', 400);
  if (!Number.isFinite(body?.heldAt) || !Number.isFinite(body?.amountUsd) || body.amountUsd <= 0) return fail('Invalid order.', 400);
  if (body.amountUsd > MAX_PER_ORDER) return fail(`Escrow is limited to $${MAX_PER_ORDER} per order.`, 400);
  const order = { saleId: body.saleId as string, heldAt: body.heldAt as number, seller: body.seller as string, amountUsd: body.amountUsd as number };

  if (process.env.ESCROW_MODE === 'testnet') {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const tx = await Promise.race([
        escrowOnchain(action, order),
        new Promise<never>((_, no) => { timer = setTimeout(() => no(new Error(`timed out after ${TESTNET_BUDGET_MS}ms`)), TESTNET_BUDGET_MS); }),
      ]);
      return NextResponse.json({ ok: true, mode: 'testnet', tx });
    } catch (e) {
      // Not a failure: the onchain refund window simply hasn't opened. The tracker counts down and retries.
      // Answered as 200 + ok:false, so browsers don't log an expected wait as a failed request.
      if (e instanceof EscrowError && e.status === 425) return NextResponse.json({ ok: false, error: e.message, ...e.extra });
      console.error(`[escrow] testnet ${action} ${order.saleId} failed, completing in mock mode:`, e instanceof Error ? e.message : e);
      return NextResponse.json({ ok: true, mode: 'mock-fallback', tx: mockTx() });
    } finally {
      clearTimeout(timer);
    }
  }

  await new Promise((r) => setTimeout(r, 450 + Math.random() * 500)); // feels like a real confirmation
  return NextResponse.json({ ok: true, mode: 'mock', tx: mockTx() });
}
