'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, Flag, ProductArt } from '@/components/brand';
import { Button, Chip, PageHead } from '@/components/ui';
import { CATEGORIES_MARKET, PRODUCTS, STORES, store } from '@/lib/mock-data';
import { money } from '@/lib/format';
import { useBanana } from '@/lib/state';

export default function MarketHome() {
  const s = useBanana();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const all = [...s.products, ...PRODUCTS];
  const list = all.filter((p) => (cat === 'All' || p.category === cat) && (q === '' || p.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageHead
        label="[ 04 / 05 ] · MARKET 🍌"
        title="Discover African"
        accent="creators."
        sub="Templates, playbooks, designs, tickets and services — from Lagos to Nairobi. Pay with card or mobile money."
        right={<Button href="/market/sell" variant="light">Sell on Banana →</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input !h-11 sm:max-w-xs" />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES_MARKET.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
      </div>

      <div className="well">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => {
            const st = store(p.handle);
            return (
              <Link key={p.id} href={`/store/${p.handle}/${p.id}`} className={`${i % 2 ? 'card-lilac' : 'card'} product-card group !p-3`}>
                <ProductArt kind={p.art} className="product-art h-36 rounded-xl" />
                <div className="mt-3 px-1">
                  <div className="flex items-center gap-2 text-[12.5px] text-[#6B5BA3]">
                    {st ? <Flag code={st.country} className="h-[11px] w-[16px]" /> : <Flag code={s.user.country} className="h-[11px] w-[16px]" />} @{p.handle} · {p.category}
                  </div>
                  <div className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight">{p.title}</div>
                  <div className="mt-3 flex items-center justify-between pb-1">
                    <span className="text-[20px] font-bold tracking-tight">{money(p.price.amount, p.price.currency)}</span>
                    <span className="btn buy-pill bg-violet px-4 py-1.5 text-[13px] text-white">Buy <span className="buy-arrow">→</span></span>
                  </div>
                </div>
              </Link>
            );
          })}
          {list.length === 0 && <div className="col-span-full py-16 text-center text-lilac">No products match yet.</div>}
        </div>
      </div>

      <div className="mt-12">
        <div className="label-mono">FEATURED STORES</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STORES.map((st) => (
            <Link key={st.handle} href={`/store/${st.handle}`} className="rounded-[22px] border border-white/15 bg-white/[0.075] p-4 transition hover:bg-white/10">
              <div className="flex items-center gap-3">
                <Avatar name={st.name} hue={st.hue} size={48} />
                <div className="min-w-0">
                  <div className="truncate text-[17px] font-semibold">{st.name}</div>
                  <div className="font-mono text-[12px] text-lilac-3">banana.africa/@{st.handle}</div>
                </div>
              </div>
              <p className="mt-3 text-[14.5px] text-body">{st.tagline}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
