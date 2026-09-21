import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isLive } from '@/lib/mode';
import { PaystackConfigError, paystackKey } from '@/lib/paystack';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Paystack → us. Signature = HMAC-SHA512 of the RAW body with the secret key, in x-paystack-signature.
 *
 * On charge.success this acknowledges the event but cannot record the sale: recordSale() writes to the buyer's
 * localStorage and there is no server-side store yet. The sale is recorded by the checkout page after
 * GET /api/pay/verify confirms the payment. Once there is a database, record it here as well (keyed by reference).
 */
export async function POST(req: Request) {
  if (!isLive) return new NextResponse('Not found', { status: 404 });
  const raw = await req.text();
  let key: string;
  try {
    key = paystackKey();
  } catch (err) {
    console.error('[pay/webhook]', err instanceof PaystackConfigError ? err.message : err);
    return new NextResponse('Not configured', { status: 500 });
  }

  const want = Buffer.from(createHmac('sha512', key).update(raw).digest('hex'));
  const got = Buffer.from(req.headers.get('x-paystack-signature') ?? '');
  if (want.length !== got.length || !timingSafeEqual(want, got)) return new NextResponse('Invalid signature', { status: 401 });

  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string; amount?: number; status?: string } };
    if (event.event === 'charge.success') console.log('[pay/webhook] charge.success', event.data?.reference, event.data?.amount);
  } catch {
    /* signed but not JSON: nothing to do */
  }
  return NextResponse.json({ received: true }); // 200 tells Paystack to stop retrying
}
