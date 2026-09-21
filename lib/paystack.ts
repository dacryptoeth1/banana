import 'server-only';

/* Paystack, TEST MODE ONLY. A key that isn't sk_test_… is refused, so a live key can't be used by accident. */

export class PaystackConfigError extends Error {}

export function paystackKey(): string {
  const k = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!k) throw new PaystackConfigError('PAYSTACK_SECRET_KEY is not set');
  if (!k.startsWith('sk_test_')) throw new PaystackConfigError('Only Paystack TEST keys (sk_test_…) are allowed');
  return k;
}

export async function paystack<T = unknown>(path: string, init?: { method?: 'GET' | 'POST'; body?: object }): Promise<{ ok: boolean; status: number; json: { status?: boolean; message?: string; data?: T } | null }> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: init?.method ?? 'GET',
    headers: { Authorization: `Bearer ${paystackKey()}`, 'Content-Type': 'application/json' },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => null) };
}

/** References are ours (bnn_…), but the verify route takes one from the URL, so it must be safe to put in a path. */
export const REFERENCE_RE = /^[A-Za-z0-9._=-]{6,64}$/;
