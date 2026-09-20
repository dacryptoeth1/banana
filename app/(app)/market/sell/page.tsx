'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Field, PageHead } from '@/components/ui';
import { ProductArt } from '@/components/brand';
import { ShareRow } from '@/components/StoreViews';
import { COUNTRIES, country, type ArtKind } from '@/lib/mock-data';
import { RATES, ago, cn, convert, money } from '@/lib/format';
import { addProduct, setPayout, useBanana, type Payout } from '@/lib/state';

const PAYOUTS: { id: Payout; label: string; sub: string }[] = [
  { id: 'usdc', label: 'USDC', sub: 'Keep it as digital dollars' },
  { id: 'local', label: 'Local currency', sub: 'Paid out in your money' },
  { id: 'banana', label: 'Banana balance', sub: 'Spend on Banana Market' },
];
const ARTS: ArtKind[] = ['logo', 'kit', 'course', 'chart'];

export default function SellerDashboard() {
  const s = useBanana();
  const cur = s.user.currency;
  const mine = s.sales.filter((x) => x.handle === s.user.handle);
  const gross = mine.reduce((a, x) => a + x.grossUsd, 0);
  const net = mine.reduce((a, x) => a + x.netUsd, 0);
  const myProducts = s.products;
  const link = `banana.africa/@${s.user.handle}`;
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState('');
  const [blurb, setBlurb] = useState('');
  const [price, setPrice] = useState('');
  const [art, setArt] = useState<ArtKind>('kit');
  const [listed, setListed] = useState<string | null>(null);
  const priceNum = Number(price.replace(/[^0-9.]/g, ''));
  const formOk = title.trim().length > 2 && priceNum >= 500;

  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${link}`); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  function list(e: React.FormEvent) {
    e.preventDefault();
    if (!formOk) return;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`;
    addProduct({
      id, handle: s.user.handle, title: title.trim(), blurb: blurb.trim() || 'A new digital product.',
      price: { amount: priceNum, currency: 'NGN' }, category: 'Templates', art,
      file: { name: `${id}.zip`, size: '5 MB' }, includes: ['Instant download', 'Lifetime access'],
    });
    setListed(id);
    setTitle(''); setBlurb(''); setPrice('');
  }

  return (
    <div>
      <PageHead label="[ SELLER ] · DASHBOARD" title="Your" accent="store." sub="Buyers pay in local money. You’re settled in stablecoin. Nobody needs to know how it works." right={<Button href={`/store/${s.user.handle}`} variant="light">View my store →</Button>} />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* stats */}
          <div className="well grid gap-3 sm:grid-cols-3">
            <div className="card !p-5"><div className="text-[13px] text-[#7A6BAE]">Sales</div><div className="mt-1 text-[34px] font-bold leading-none tracking-tight">{mine.length}</div></div>
            <div className="card-lilac !p-5"><div className="text-[13px] text-[#7A6BAE]">Gross sales</div><div className="mt-1 text-[30px] font-bold leading-none tracking-tight">{money(convert(gross, 'USD', cur), cur, { compact: true })}</div><div className="mt-1 text-[12.5px] text-[#7A6BAE]">≈ {money(gross, 'USD', { decimals: 2 })}</div></div>
            <div className="card !p-5"><div className="text-[13px] text-[#7A6BAE]">Settled to you</div><div className="mt-1 text-[30px] font-bold leading-none tracking-tight text-[#8A6A12]">{money(net, 'USD', { decimals: 2 })}</div><div className="mt-1 text-[12.5px] text-[#7A6BAE]">after 2% Banana fee</div></div>
          </div>

          {/* sales */}
          <div className="well">
            <div className="mb-3 px-2 pt-1 text-[15px] font-semibold">Recent sales</div>
            {mine.length === 0 ? (
              <div className="card text-center !py-10">
                <div className="text-[40px]">🛍️</div>
                <div className="mt-2 text-[18px] font-semibold">No sales yet</div>
                <p className="mx-auto mt-1 max-w-sm text-[14.5px] text-[#6B5BA3]">Share your store link. When someone buys, you’ll see the settlement here in seconds. Try it yourself: open your store as a buyer.</p>
                <div className="mt-5"><Button href={`/store/${s.user.handle}`}>Try a test purchase →</Button></div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mine.map((x) => (
                  <div key={x.id} className="card !p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[16px] font-semibold">{x.title}</div>
                        <div className="mt-0.5 text-[13px] text-[#7A6BAE]">{x.id} · from {country(x.buyerCountry).name} · {x.method} · {ago(x.at)}</div>
                      </div>
                      <div className="text-right"><div className="text-[17px] font-bold text-[#8A6A12]">+{money(x.netUsd, 'USD', { decimals: 2 })}</div><div className="text-[12px] text-[#7A6BAE]">{x.payout === 'usdc' ? 'settled in USDC' : x.payout === 'local' ? 'paid out locally' : 'to Banana balance'}</div></div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between rounded-lg bg-lilac-2 px-3 py-2 text-[12.5px] text-[#5A4A93]"><span>✓ Settled · receipt saved</span><Link href="/wallet" className="font-semibold text-violet">See in wallet →</Link></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* listing form */}
          <div className="well">
            <div className="mb-3 px-2 pt-1 text-[15px] font-semibold">List a product</div>
            <form onSubmit={list} className="card !p-5 space-y-4">
              <Field label="Product name"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Social Media Kit" /></Field>
              <Field label="Short description"><input className="input" value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="20 editable Canva templates for small brands" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (₦ naira)" hint="Most creators start between ₦5,000 and ₦15,000."><input className="input" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9,000" /></Field>
                <Field label="Cover style">
                  <div className="flex gap-2">{ARTS.map((a) => <button type="button" key={a} onClick={() => setArt(a)} className={cn('overflow-hidden rounded-lg ring-2 transition', art === a ? 'ring-violet' : 'ring-transparent')}><ProductArt kind={a} className="h-11 w-14" /></button>)}</div>
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!formOk}>List product →</Button>
                {priceNum >= 500 && <span className="text-[13px] text-[#7A6BAE]">Buyers in Ghana see ≈ {money(convert(priceNum, 'NGN', 'GHS'), 'GHS')} · you receive ≈ {money(convert(priceNum, 'NGN', 'USD') * 0.98, 'USD', { decimals: 2 })} in USDC</span>}
              </div>
              {listed && (
                <div className="pop rounded-xl bg-gold/25 px-4 py-3 text-[14.5px] text-[#6B4E00]">Listed ✓ <Link href={`/store/${s.user.handle}/${listed}`} className="font-semibold underline">View product</Link> · <Link href={`/store/${s.user.handle}`} className="font-semibold underline">Open store</Link></div>
              )}
            </form>
            {myProducts.length > 0 && <div className="mt-3 px-2 text-[13px] text-lilac">You have listed {myProducts.length} product{myProducts.length > 1 ? 's' : ''}.</div>}
          </div>
        </div>

        {/* right column */}
        <div className="space-y-5">
          <div className="well">
            <div className="card !p-5">
              <div className="text-[13px] text-[#7A6BAE]">Your store link</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="min-w-0 flex-1 truncate rounded-xl bg-lilac-2 px-4 py-3 font-mono text-[13.5px]">{link}</div>
                <Button size="sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</Button>
              </div>
              <div className="mt-4 rounded-xl bg-[#3D1F8C] p-3"><ShareRow handle={s.user.handle} name={`${s.user.name}’s Store`} /></div>
            </div>
          </div>

          <div className="well">
            <div className="card !p-5">
              <div className="text-[15px] font-semibold">Payout choice</div>
              <p className="mt-1 text-[13.5px] text-[#7A6BAE]">How should new sales arrive?</p>
              <div className="mt-3 space-y-2">
                {PAYOUTS.map((p) => (
                  <button key={p.id} onClick={() => setPayout(p.id)} className={cn('flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ring-1 ring-inset transition', s.payout === p.id ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#E5DCFA] hover:bg-lilac-2')}>
                    <span className={cn('flex h-5 w-5 items-center justify-center rounded-full ring-2', s.payout === p.id ? 'ring-violet' : 'ring-[#CFC3EE]')}>{s.payout === p.id && <i className="h-2.5 w-2.5 rounded-full bg-violet" />}</span>
                    <span><span className="block text-[15px] font-semibold">{p.id === 'local' ? `${COUNTRIES.find((c) => c.code === s.user.country)!.currency} · local currency` : p.label}</span><span className="block text-[12.5px] text-[#7A6BAE]">{p.sub}</span></span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-[12.5px] text-[#7A6BAE]">Demo rate: ₦{RATES.NGN.toLocaleString()} ≈ $1.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
