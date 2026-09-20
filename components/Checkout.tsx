'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Field } from './ui';
import { Flag } from './brand';
import { COUNTRIES, country, type CountryCode, type Product } from '@/lib/mock-data';
import { convert, money, shortHash, cn } from '@/lib/format';
import { recordSale, switchRole, useBanana, type Sale } from '@/lib/state';

type Method = 'Paystack' | 'MoMo' | 'Card';

export function Checkout({ product }: { product: Product }) {
  const router = useRouter();
  const me = useBanana();
  const [typedEmail, setEmail] = useState<string | null>(null);
  const email = typedEmail ?? me.user.email; // prefilled, so Pay is never a dead end
  const [phone, setPhone] = useState('');
  const [from, setFrom] = useState<CountryCode>('GH');
  const [method, setMethod] = useState<Method>('Paystack');
  const [stage, setStage] = useState<'form' | 'paying' | 'done'>('form');
  const [sale, setSale] = useState<Sale | null>(null);
  const [details, setDetails] = useState(false);

  const { amount, currency } = product.price;
  const usd = convert(amount, currency, 'USD');
  const buyer = country(from);
  const approx =
    currency === 'USD'
      ? `≈ ${money(convert(amount, 'USD', buyer.currency), buyer.currency)}`
      : `≈ ${money(usd, 'USD', { decimals: 2 })}`;
  const momoName = buyer.buyerRails[0];
  const valid = /.+@.+\..+/.test(email);

  function pay() {
    setStage('paying');
    setTimeout(() => {
      const rail = method === 'MoMo' ? momoName : method;
      const s = recordSale({ product, grossUsd: usd, buyerEmail: email, buyerCountry: from, method: rail, sellerHandle: product.handle });
      setSale(s);
      setStage('done');
    }, 1700);
  }

  function download() {
    const blob = new Blob([`Banana Market\n\n${product.title}\nOrder ${sale?.id}\n\nThanks for your purchase!\n\nIncluded:\n- ${product.includes.join('\n- ')}\n`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = product.file.name.replace(/\.[a-z0-9]+$/i, '') + '-demo.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (stage === 'done' && sale) {
    return (
      <div className="card pop !p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[30px]">🔓</div>
        <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.03em]">Unlocked.</h2>
        <p className="text-[17px] text-[#4C3E82]">Receipt saved. We emailed a copy to <b>{sale.buyerEmail}</b>.</p>

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

        <div className="mt-5 rounded-2xl border border-[#EDE6FF] p-4 text-left text-[14px] text-[#4C3E82]">
          <div className="flex justify-between"><span>Order</span><b>{sale.id}</b></div>
          <div className="mt-1.5 flex justify-between"><span>Paid</span><b>{money(amount, currency)} · {sale.method}</b></div>
          <div className="mt-1.5 flex justify-between"><span>Seller</span><b>@{product.handle}</b></div>
          <button onClick={() => setDetails((d) => !d)} className="mt-3 text-[13px] font-semibold text-violet">{details ? 'Hide' : 'Show'} receipt {details ? '↑' : '↓'}</button>
          {details && (
            <div className="pop mt-3 space-y-1.5 rounded-xl bg-lilac-2 p-3.5 text-[13px]">
              <div className="flex justify-between"><span>Seller received</span><b>{money(sale.netUsd, 'USD', { decimals: 2 })} in USDC</b></div>
              <div className="flex justify-between"><span>Banana fee (2%)</span><b>{money(sale.grossUsd - sale.netUsd, 'USD', { decimals: 2 })}</b></div>
              <div className="flex justify-between"><span>Reference</span><b className="font-mono">{shortHash(sale.ref)}</b></div>
              <a href="#" onClick={(e) => e.preventDefault()} className="block pt-1 text-[12px] text-[#7A6BAE] underline underline-offset-2">Explorer ↗</a>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-center gap-4 text-[14px]">
          <Link href={`/store/${product.handle}`} className="font-semibold text-violet">Back to store</Link>
          <Link href="/wallet" className="font-semibold text-violet">Open wallet</Link>
        </div>
      </div>
    );
  }

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
            {(['Paystack', 'MoMo', 'Card'] as Method[]).map((m) => (
              <button key={m} onClick={() => setMethod(m)} className={cn('rounded-xl px-2 py-3 text-[13.5px] font-semibold ring-1 ring-inset transition', method === m ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#DCD2F5] hover:bg-lilac-2')}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {method === 'MoMo' && (
          <Field label={`${momoName} number (optional in this demo)`}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" inputMode="tel" /></Field>
        )}
        {method === 'Card' && <div className="rounded-xl bg-lilac-2 px-4 py-3 text-[13.5px] text-[#5A4A93]">You’ll enter card details securely on the next step.</div>}
      </div>

      <div className="mt-6"><Button size="lg" full disabled={!valid || stage === 'paying'} onClick={pay}>
        {stage === 'paying' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Confirming your payment…</> : <>Pay {money(amount, currency)}</>}
      </Button></div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#7A6BAE]">🔒 Unlocks instantly after payment</div>
      {!valid && email.length > 0 && <div className="mt-2 text-center text-[12.5px] text-[#B0456A]">Enter a valid email so we can send your receipt.</div>}
    </div>
  );
}
