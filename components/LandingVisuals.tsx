import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { BananaMark } from './brand';
import { stagger } from '@/lib/motion';

/** Barely-there moving light behind the marketing pages. Transform-only, no blur filters. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="ambient-blob ambient-a" />
      <span className="ambient-blob ambient-b" />
      <span className="ambient-blob ambient-c hidden md:block" />
    </div>
  );
}

/* ------------------------------ How a sale moves --------------------------- */
const I = (d: string) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const STEPS: { title: string; sub: string; tag: string; icon: ReactNode; brand?: boolean; end?: boolean }[] = [
  { title: 'Buyer', sub: 'Pays in their local currency', tag: '₦ · GH₵ · KSh · R', icon: I('M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0') },
  { title: 'Payment', sub: 'Card or mobile money', tag: 'Card · MoMo', icon: I('M3 7h18v10H3zM3 11h18M7 15h3') },
  { title: 'Banana Market', sub: 'Checkout and delivery · 2% fee', tag: 'Checkout', icon: <BananaMark size={22} />, brand: true },
  { title: 'Creator', sub: 'Digital Wallet is credited', tag: 'Wallet', icon: I('M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2zM16 14h2') },
  { title: 'Settlement', sub: 'Stablecoin, receipt with onchain details', tag: 'USDC', icon: I('M20 6L9 17l-5-5'), end: true },
];

export function SaleFlow() {
  return (
    <div className="px-1 py-1">
      <div className="label-mono">How a sale moves</div>
      <ol className="relative mt-4">
        {/* Track runs node centre to node centre (rows are 64px). */}
        <div aria-hidden className="absolute bottom-8 left-[21px] top-8 w-px bg-white/15">
          <div className="flow-runner" />
        </div>
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex h-16 items-center gap-4" style={{ '--i': i } as CSSProperties}>
            <span className={`flow-node relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${s.brand ? 'bg-ink ring-gold/50' : s.end ? 'bg-gold text-ink ring-gold' : 'bg-[#4A28A6] text-lilac ring-white/20'}`}>
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold tracking-tight">{s.title}</div>
              <div className="truncate text-[13.5px] text-body">{s.sub}</div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-lilac ring-1 ring-inset ring-white/15 sm:inline">{s.tag}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------------- Categories ------------------------------ */
const CATS: { name: string; sub: string; icon: string }[] = [
  { name: 'Designs', sub: 'Logos, brand kits', icon: 'M12 3a9 9 0 100 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.4-1-2.4s.8-1.5 1.8-1.5H17a4 4 0 004-4c0-4.7-4-8.5-9-8.5zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01' },
  { name: 'Templates', sub: 'Notion, Figma, code', icon: 'M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z' },
  { name: 'Courses', sub: 'Playbooks and guides', icon: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13' },
  { name: 'Services', sub: 'Hire a creator', icon: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0M14 14.5a6 6 0 018 5.5' },
  { name: 'Tickets', sub: 'Events and passes', icon: 'M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4zM14 6v12' },
  { name: 'Gaming items', sub: 'Skins and codes', icon: 'M6 9h4M8 7v4M15 8h.01M18 10h.01M7 4h10a5 5 0 015 5v3a5 5 0 01-9 3h-2a5 5 0 01-9-3V9a5 5 0 015-5z' },
];

export function CategoryTiles({ from = 0 }: { from?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {CATS.map((c, i) => (
        <div key={c.name} className="reveal-item" style={stagger(from + i)}>
          <Link href="/market" className="cat-tile group flex h-full flex-col rounded-[20px] border border-white/15 bg-white/[0.06] p-4">
            <span className="cat-icon flex h-10 w-10 items-center justify-center rounded-xl bg-lilac-2 text-violet">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={c.icon} />
              </svg>
            </span>
            <span className="mt-4 text-[16px] font-semibold tracking-tight">{c.name}</span>
            <span className="mt-0.5 flex items-center justify-between gap-2 text-[13px] text-body">
              {c.sub}
              <span className="cat-arrow text-lilac" aria-hidden>→</span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
