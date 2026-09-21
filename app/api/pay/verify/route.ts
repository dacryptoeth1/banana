import { NextResponse } from 'next/server';
import { isLive } from '@/lib/mode';
import { findProduct, toKobo } from '@/lib/pay';
import { PaystackConfigError, REFERENCE_RE, paystack } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

type Tx = { status: string; amount: number; currency: string; customer?: { email?: string }; metadata?: { productId?: string; handle?: string; buyerCountry?: string; method?: string } | null };

/**
 * GET ?reference= → asks Paystack whether the payment really succeeded (and for the right product and amount).
 * The checkout page calls this on the return URL and only then records the sale, so it doesn't depend on the webhook's timing.
 */
export async function GET(req: Request) {
  if (!isLive) return fail('Not found', 404);
  const reference = new URL(req.url).searchParams.get('reference') ?? '';
  if (!REFERENCE_RE.test(reference)) return fail('That payment reference is not valid.', 400);

  try {
    const r = await paystack<Tx>(`/transaction/verify/${reference}`);
    if (r.status === 404) return fail('We could not find that payment.', 404);
    const tx = r.json?.data;
    if (!r.ok || !r.json?.status || !tx) {
      console.error('[pay/verify] Paystack', r.status, r.json?.message);
      return fail("We couldn't confirm that payment. Please try again.", 502);
    }
    const md = tx.metadata && typeof tx.metadata === 'object' ? tx.metadata : {};
    const product = findProduct(md.productId, md.handle);
    const paid = tx.status === 'success' && !!product && tx.currency === 'NGN' && tx.amount === toKobo(product);
    return NextResponse.json({
      ok: true,
      paid,
      status: tx.status, // success | abandoned | failed | pending | …  (the page keeps waiting on the in-progress ones)
      productId: product?.id,
      handle: product?.handle,
      buyerCountry: md.buyerCountry,
      method: md.method,
      email: tx.customer?.email,
    });
  } catch (err) {
    console.error('[pay/verify]', err instanceof PaystackConfigError ? err.message : err);
    return fail(err instanceof PaystackConfigError ? 'Payments are not set up yet.' : "We couldn't confirm that payment. Please try again.", err instanceof PaystackConfigError ? 500 : 502);
  }
}
