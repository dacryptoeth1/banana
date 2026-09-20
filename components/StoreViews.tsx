'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, Flag, ProductArt } from './brand';
import { Button } from './ui';
import { Checkout } from './Checkout';
import { PRODUCTS, country, store as findStore, type Product } from '@/lib/mock-data';
import { money } from '@/lib/format';
import { useBanana } from '@/lib/state';

/** All products for a store: mock + anything this user has listed. */
export function useStoreProducts(handle: string): Product[] {
  const s = useBanana();
  return [...s.products.filter((p) => p.handle === handle), ...PRODUCTS.filter((p) => p.handle === handle)];
}

export function useStoreInfo(handle: string) {
  const s = useBanana();
  const known = findStore(handle);
  if (known) return known;
  if (s.user.handle === handle) return { handle, name: `${s.user.name}’s Store`, tagline: 'Digital products. Instant delivery.', country: s.user.country, hue: 268 };
  return null;
}

export function ShareRow({ handle, name }: { handle: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://banana.africa/@${handle}`;
  const text = encodeURIComponent(`Check out ${name} on Banana 🍌 ${url}`);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={copy} className="btn bg-white/10 px-4 py-2 text-[13.5px] text-white ring-1 ring-inset ring-white/20 hover:bg-white/15">{copied ? 'Copied ✓' : 'Copy link'}</button>
      <a className="btn bg-white/10 px-4 py-2 text-[13.5px] text-white ring-1 ring-inset ring-white/20 hover:bg-white/15" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${text}`}>Share on X</a>
      <a className="btn bg-white/10 px-4 py-2 text-[13.5px] text-white ring-1 ring-inset ring-white/20 hover:bg-white/15" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${text}`}>WhatsApp</a>
      <a className="btn bg-white/10 px-4 py-2 text-[13.5px] text-white ring-1 ring-inset ring-white/20 hover:bg-white/15" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`}>Telegram</a>
    </div>
  );
}

export function StoreView({ handle }: { handle: string }) {
  const info = useStoreInfo(handle);
  const products = useStoreProducts(handle);
  if (!info) return <div className="py-24 text-center"><h1 className="text-[36px] font-semibold">Store not found</h1><p className="mt-2 text-body">There’s no store at banana.africa/@{handle} yet.</p><div className="mt-6"><Button href="/market">Back to Market</Button></div></div>;
  const c = country(info.country);
  return (
    <div className="relative">
      <div className="rise">
        <div className="label-mono">[ STORE ] &nbsp;<span className="normal-case tracking-normal text-white/90">banana.africa/@{handle}</span></div>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <Avatar name={info.name} hue={info.hue} size={96} />
          <div>
            <h1 className="flex items-center gap-3 text-[40px] font-semibold leading-none tracking-[-0.04em] sm:text-[52px]">{info.name}<span className="text-[36px]">🍌</span></h1>
            <p className="mt-3 text-[17.5px] text-body">{info.tagline}</p>
            <div className="mt-2 flex items-center gap-2 text-[13.5px] text-lilac-3"><Flag code={info.country} /> {c.name}</div>
          </div>
        </div>
        <div className="mt-6"><ShareRow handle={handle} name={info.name} /></div>
      </div>

      <div className="well mt-8 grid gap-3 sm:grid-cols-2">
        {products.map((p, i) => (
          <Link key={p.id} href={`/store/${handle}/${p.id}`} className={`${i % 3 === 1 ? 'card-lilac' : 'card'} group flex items-center gap-4 !p-3 transition hover:-translate-y-0.5`}>
            <ProductArt kind={p.art} className="h-[104px] w-[104px] shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="text-[16.5px] font-semibold leading-snug tracking-tight">{p.title}</div>
              <div className="mt-1 text-[19px] font-bold tracking-tight">{money(p.price.amount, p.price.currency)}</div>
              <span className="btn mt-2 bg-violet px-4 py-1.5 text-[12.5px] text-white">Buy</span>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-[14.5px] text-body">🔒 Pay in local currency. Seller receives stablecoin. You never touch a wallet.</p>
    </div>
  );
}

export function ProductView({ handle, productId }: { handle: string; productId: string }) {
  const info = useStoreInfo(handle);
  const products = useStoreProducts(handle);
  const p = products.find((x) => x.id === productId);
  if (!p || !info) return <div className="py-24 text-center"><h1 className="text-[36px] font-semibold">Product not found</h1><div className="mt-6"><Button href={`/store/${handle}`}>Back to store</Button></div></div>;
  return (
    <div className="relative">
      <Link href={`/store/${handle}`} className="text-[14.5px] text-lilac hover:text-white">← {info.name}</Link>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="well">
            <ProductArt kind={p.art} className="h-[260px] rounded-[20px] sm:h-[320px]" />
          </div>
          <div className="label-mono mt-8">{p.category} · by @{handle}</div>
          <h1 className="mt-3 text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[50px]">{p.title}</h1>
          <p className="mt-4 max-w-lg text-[18px] leading-relaxed text-body">{p.blurb}</p>
          <div className="mt-6 text-[13px] font-semibold uppercase tracking-wider text-lilac-3">What’s included</div>
          <ul className="mt-3 space-y-2 text-[16px]">
            {p.includes.map((i) => <li key={i} className="flex gap-2.5"><span className="text-gold">✓</span>{i}</li>)}
            <li className="flex gap-2.5 text-body"><span className="text-gold">✓</span>Instant delivery · {p.file.size}</li>
          </ul>
        </div>
        <div className="well lg:sticky lg:top-24"><Checkout product={p} /></div>
      </div>
    </div>
  );
}

