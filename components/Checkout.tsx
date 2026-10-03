'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { Button, Field } from './ui';
import { Flag } from './brand';
import { SuccessBurst } from './SuccessBurst';
import { SaleReceipt } from './SaleReceipt';
import { COUNTRIES, country, type CountryCode, type Product } from '@/lib/mock-data';
import { convert, money, cn } from '@/lib/format';
import { recordSale, switchRole, useBanana, type Sale } from '@/lib/state';
import { isLive } from '@/lib/mode';
import { toKobo } from '@/lib/pay';
import { softSpring } from '@/lib/motion';

export type Method = 'Paystack' | 'MoMo' | 'Card';
type Stage = 'form' | 'paying' | 'done';

/**
 * The payment itself, shared by the store checkout and the pay-by-link page.
 * Demo: a short pause, then a recorded sale. Live: Paystack redirect, then verify on return.
 * `returnTo` is where Paystack sends the buyer back to: the store product page or the pay link.
 */
export function useCheckout(product: Product, returnTo: 'store' | 'pay' = 'store') {
  const me = useBanana();
  const [stage, setStage] = useState<Stage>('form');
  const [sale, setSale] = useState<Sale | null>(null);
  const [note, setNote] = useState('Confirming your payment…');
  const [error, setError] = useState('');
  const usd = convert(product.price.amount, product.price.currency, 'USD');

  /* Live: ask our server for a Paystack checkout page, then send the buyer there. */
  async function payLive(email: string, from: CountryCode, method: Method) {
    setStage('paying'); setNote('Taking you to Paystack…'); setError('');
    try {
      const res = await fetch('/api/pay/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount: toKobo(product), returnTo, metadata: { productId: product.id, handle: product.handle, buyerCountry: from, method } }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? 'Something went wrong. Please try again.');
      window.location.assign(j.authorization_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setStage('form');
    }
  }

  /* Live: Paystack sends the buyer back here with ?reference=…  Confirm it with Paystack, then record the sale once. */
  useEffect(() => {
    if (!isLive) return;
    const q = new URLSearchParams(window.location.search);
    const ref = q.get('reference') ?? q.get('trxref');
    if (!ref) return;
    let cancelled = false;
    setStage('paying'); setNote('Confirming your payment…'); setError('');
    (async () => {
      for (let i = 0; i < 5; i++) {
        const r = await fetch(`/api/pay/verify?reference=${encodeURIComponent(ref)}`).then((x) => x.json()).catch(() => null);
        if (cancelled) return;
        if (r?.ok && r.paid) {
          if (r.productId !== product.id || r.handle !== product.handle) break; // a payment for something else
          const s = recordSale({ product, grossUsd: usd, buyerEmail: r.email ?? me.user.email, buyerCountry: r.buyerCountry ?? 'GH', method: r.method ?? 'Paystack', sellerHandle: product.handle, paystackRef: ref });
          window.history.replaceState(null, '', window.location.pathname);
          setSale(s); setStage('done');
          return;
        }
        if (r && (!r.ok || ['abandoned', 'failed', 'reversed'].includes(r.status))) break;
        await new Promise((ok) => setTimeout(ok, 2000)); // still processing: ask again
      }
      if (cancelled) return;
      window.history.replaceState(null, '', window.location.pathname);
      setError("We couldn't confirm that payment. If you were charged, it will show up shortly. Otherwise try again.");
      setStage('form');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pay(input: { email: string; from: CountryCode; method: Method }) {
    if (isLive) return void payLive(input.email, input.from, input.method);
    setStage('paying'); setNote('Confirming your payment…'); setError('');
    setTimeout(() => {
      const rail = input.method === 'MoMo' ? country(input.from).buyerRails[0] : input.method;
      const s = recordSale({ product, grossUsd: usd, buyerEmail: input.email, buyerCountry: input.from, method: rail, sellerHandle: product.handle });
      setSale(s);
      setStage('done');
    }, 1700);
  }

  return { stage, sale, note, error, pay, usd };
}

/** "Unlocked." Burst, download, the seller's side, and the receipt sliding up. */
export function CheckoutSuccess({ product, sale }: { product: Product; sale: Sale }) {
  const router = useRouter();
  const me = useBanana();
  const { amount, currency } = product.price;

  function download() {
    const blob = new Blob([`Banana Market\n\n${product.title}\nOrder ${sale.id}\n\nThanks for your purchase!\n\nIncluded:\n- ${product.includes.join('\n- ')}\n`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = product.file.name.replace(/\.[a-z0-9]+$/i, '') + '-demo.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="card !p-6 text-center">
      <SuccessBurst size={76} />
      <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.03em]">Unlocked.</h2>
        <p className="text-[17px] text-[#4C3E82]">Receipt saved. We emailed a copy to <b>{sale.buyerEmail}</b>.</p>
      </m.div>

      <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.5 }}>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-lilac-2 p-3.5 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[20px]">📦</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-semibold">{product.file.name}</div>
            <div className="text-[12.5px] text-[#7A6BAE]">{product.file.size} · ready</div>
          </div>
        </div>
        <div className="mt-4"><Button full onClick={download}>Download {product.title} ↓</Button></div>
        <div className="mt-3">
          {me.role === 'buyer' ? (
            <Button full variant="soft" onClick={() => { switchRole('seller'); router.push('/market/sell'); }}>See the seller’s side →</Button>
          ) : (
            <Button full variant="soft" href="/market/sell">See your settlement →</Button>
          )}
        </div>

        <div className="mt-5"><SaleReceipt sale={sale} amount={money(amount, currency)} /></div>
        <div className="mt-5 flex justify-center gap-4 text-[14px]">
          <Link href={`/store/${product.handle}`} className="font-semibold text-violet">Back to store</Link>
          <Link href="/wallet" className="font-semibold text-violet">Open wallet</Link>
        </div>
      </m.div>
    </div>
  );
}

export function Checkout({ product }: { product: Product }) {
  const me = useBanana();
  const [typedEmail, setEmail] = useState<string | null>(null);
  const email = typedEmail ?? me.user.email; // prefilled, so Pay is never a dead end
  const [phone, setPhone] = useState('');
  const [from, setFrom] = useState<CountryCode>('GH');
  const [method, setMethod] = useState<Method>('Paystack');
  const { stage, sale, note, error, pay, usd } = useCheckout(product, 'store');

  const { amount, currency } = product.price;
  const buyer = country(from);
  const approx =
    currency === 'USD'
      ? `≈ ${money(convert(amount, 'USD', buyer.currency), buyer.currency)}`
      : `≈ ${money(usd, 'USD', { decimals: 2 })}`;
  const momoName = buyer.buyerRails[0];
  const valid = /.+@.+\..+/.test(email);

  if (stage === 'done' && sale) return <CheckoutSuccess product={product} sale={sale} />;

  return (
    <div className="card !p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-[#8A7BBF]">CHECKOUT</div>
          <div className="mt-1 text-[20px] font-semibold leading-tight tracking-tight">{product.title}</div>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold leading-none tracking-tight">{money(amount, currency)}</div>
          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[12.5px] text-[#7A6BAE]">{approx} · paid from {buyer.name} <Flag code={from} className="h-[12px] w-[18px]" /></div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ama@studio.gh" autoComplete="email" /></Field>
        <Field label="Paying from">
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value as CountryCode)}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
          </select>
        </Field>
        <div>
          <span className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#5A4A93]">Pay with</span>
          <div className="grid grid-cols-3 gap-2.5">
            {(['Paystack', 'MoMo', 'Card'] as Method[]).map((mth) => (
              <button key={mth} onClick={() => setMethod(mth)} className={cn('rounded-xl px-2 py-3 text-[13.5px] font-semibold ring-1 ring-inset transition', method === mth ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#DCD2F5] hover:bg-lilac-2')}>
                {mth}
              </button>
            ))}
          </div>
        </div>
        {method === 'MoMo' && !isLive && (
          <Field label={`${momoName} number (optional in this demo)`}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" inputMode="tel" /></Field>
        )}
        {method === 'Card' && <div className="rounded-xl bg-lilac-2 px-4 py-3 text-[13.5px] text-[#5A4A93]">You’ll enter card details securely on the next step.</div>}
      </div>

      <div className="mt-6"><Button size="lg" full disabled={!valid || stage === 'paying'} onClick={() => pay({ email, from, method })}>
        {stage === 'paying' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {note}</> : <>Pay {money(amount, currency)}</>}
      </Button></div>
      {error && <div role="alert" className="mt-3 text-center text-[13.5px] font-medium text-[#B0456A]">{error}</div>}
      <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#7A6BAE]">🔒 Unlocks instantly after payment</div>
      {!valid && email.length > 0 && <div className="mt-2 text-center text-[12.5px] text-[#B0456A]">Enter a valid email so we can send your receipt.</div>}
    </div>
  );
}
