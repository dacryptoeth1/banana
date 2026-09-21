import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { isLive } from '@/lib/mode';
import { EMAIL_RE, normalizeEmail } from '@/lib/otp';
import { COUNTRIES } from '@/lib/mock-data';
import { PAY_METHODS, findProduct, toKobo } from '@/lib/pay';
import { PaystackConfigError, paystack } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/** POST { email, amount (kobo, NGN), metadata: { productId, handle, buyerCountry?, method? } } → { authorization_url, reference } */
export async function POST(req: Request) {
  if (!isLive) return fail('Not found', 404);
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const md = body?.metadata;
  if (!EMAIL_RE.test(email) || email.length > 254) return fail('Enter a valid email so we can send your receipt.', 400);

  const product = findProduct(md?.productId, md?.handle);
  if (!product) return fail('We could not find that product.', 404);
  // The price comes from the product, never from the browser. The client's amount is only a consistency check.
  if (body?.amount !== toKobo(product)) return fail('That amount does not match the product price.', 400);

  const buyerCountry = COUNTRIES.some((c) => c.code === md?.buyerCountry) ? md.buyerCountry : 'NG';
  const method = PAY_METHODS.find((m) => m === md?.method) ?? 'Paystack';
  const reference = `bnn_${randomBytes(9).toString('hex')}`;

  try {
    const r = await paystack<{ authorization_url: string; reference: string }>('/transaction/initialize', {
      method: 'POST',
      body: {
        email,
        amount: toKobo(product),
        currency: 'NGN',
        reference,
        callback_url: `${new URL(req.url).origin}/store/${product.handle}/${product.id}`,
        metadata: { productId: product.id, handle: product.handle, buyerCountry, method },
      },
    });
    const url = r.json?.data?.authorization_url;
    if (!r.ok || !r.json?.status || !url?.startsWith('https://checkout.paystack.com/')) {
      console.error('[pay/initialize] Paystack', r.status, r.json?.message);
      return fail("We couldn't start that payment. Please try again.", 502);
    }
    return NextResponse.json({ ok: true, authorization_url: url, reference: r.json?.data?.reference ?? reference });
  } catch (err) {
    console.error('[pay/initialize]', err instanceof PaystackConfigError ? err.message : err);
    return fail(err instanceof PaystackConfigError ? 'Payments are not set up yet.' : "We couldn't start that payment. Please try again.", err instanceof PaystackConfigError ? 500 : 502);
  }
}
