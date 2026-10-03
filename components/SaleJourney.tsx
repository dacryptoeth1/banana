'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, m, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { convert, money, cn } from '@/lib/format';
import { easeOut } from '@/lib/motion';

/* One real demo sale: Logo Design, ₦15,000, bought from Accra, settled to Lagos. */
const NGN = 15000;
const usd = convert(NGN, 'NGN', 'USD');
const net = usd * 0.98;

const STOPS = [
  { title: 'Buyer in Accra', sub: 'Pays in cedis, in their own currency', label: money(convert(NGN, 'NGN', 'GHS'), 'GHS', { decimals: 2 }) },
  { title: 'Payment', sub: 'Mobile money or card. No wallet', label: 'MoMo · Card' },
  { title: 'Banana Market', sub: 'Checkout and delivery · 2% fee', label: money(usd, 'USD', { decimals: 2 }) },
  { title: 'Settlement', sub: 'Arrives as stablecoin', label: `${net.toFixed(2)} USDC` },
  { title: 'Creator in Lagos', sub: 'Digital Wallet credited in naira terms', label: money(convert(net, 'USD', 'NGN'), 'NGN') },
];
const AT = [0, 0.25, 0.5, 0.75, 1]; // where each stop sits along the path
const PATH = 'M30 150 C 80 30, 150 30, 180 100 S 280 175, 330 60';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SaleJourney() {
  const box = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const inView = useInView(box, { amount: 0.45 });
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const [stage, setStage] = useState(0);
  const [pts, setPts] = useState<{ x: number; y: number }[] | null>(null);

  // Stop positions come from the real path geometry, so the coin always lands on them.
  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const L = p.getTotalLength();
    setPts(AT.map((f) => { const q = p.getPointAtLength(f * L); return { x: q.x, y: q.y }; }));
  }, []);

  const pointAt = (v: number) => {
    const p = path.current;
    if (!p) return { x: 30, y: 150 };
    return p.getPointAtLength(v * p.getTotalLength());
  };
  const x = useTransform(progress, (v) => pointAt(v).x);
  const y = useTransform(progress, (v) => pointAt(v).y);

  // The journey plays while in view, and loops with a pause on arrival.
  useEffect(() => {
    if (!inView || !pts) return;
    let alive = true;
    (async () => {
      while (alive) {
        for (let i = 1; i < STOPS.length && alive; i++) {
          if (reduced) progress.set(AT[i]);
          else await animate(progress, AT[i], { duration: 0.55, ease: easeOut });
          if (!alive) return;
          setStage(i);
          await wait(reduced ? 1400 : 700);
        }
        await wait(1800);
        if (!alive) return;
        progress.set(0);
        setStage(0);
        await wait(600);
      }
    })();
    return () => { alive = false; progress.stop(); };
  }, [inView, pts, reduced, progress]);

  const label = STOPS[stage].label;
  const w = label.length * 7.4 + 22;

  return (
    <div ref={box} className="px-1 py-1">
      <div className="flex items-center justify-between">
        <div className="label-mono">How a sale moves</div>
        <span className="font-mono text-[11px] text-lilac-3">Logo Design · ₦15,000</span>
      </div>

      <svg viewBox="-20 -6 400 200" className="mt-2 block w-full" role="img" aria-label="A payment travels from a buyer in Accra to a creator in Lagos: cedis, then mobile money or card, then dollars, then USDC, then naira.">
        <defs>
          <radialGradient id="coin-glow">
            <stop offset="0" stopColor="#FFC93C" stopOpacity=".7" />
            <stop offset="1" stopColor="#FFC93C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={path} d={PATH} fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
        <m.path d={PATH} fill="none" stroke="#FFC93C" strokeOpacity=".85" strokeWidth="2.4" strokeLinecap="round" style={{ pathLength: progress }} />

        {pts?.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === STOPS.length - 1 ? 6 : 4.5} className="transition-[fill] duration-300" fill={i <= stage ? '#FFC93C' : '#5B3BB8'} stroke="#D9C8FF" strokeOpacity=".4" />
        ))}
        <text x="30" y="178" textAnchor="middle" className="fill-white font-mono text-[11px]">Accra · GH₵</text>
        <text x="330" y="36" textAnchor="middle" className="fill-white font-mono text-[11px]">Lagos · ₦</text>

        {pts && (
          <m.g style={{ x, y }}>
            <circle r="24" fill="url(#coin-glow)" />
            <circle r="9" fill="#FFC93C" stroke="#FFE39A" strokeWidth="2" />
            <circle r="4.5" fill="none" stroke="#8A6A12" strokeOpacity=".5" />
            <AnimatePresence mode="popLayout" initial={false}>
              <m.g key={label} initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.9 }} transition={{ duration: 0.25 }}>
                <rect x={-w / 2} y={-44} width={w} height={24} rx={12} fill="#fff" />
                <text y={-27.5} textAnchor="middle" className="fill-ink text-[12.5px] font-bold">{label}</text>
              </m.g>
            </AnimatePresence>
          </m.g>
        )}
      </svg>

      <ol className="mt-3 space-y-1.5">
        {STOPS.map((s, i) => (
          <li key={s.title} className={cn('flex items-center gap-3 rounded-2xl px-3 py-2 transition-[background-color,opacity] duration-300', i === stage ? 'bg-white/10 opacity-100' : i < stage ? 'opacity-80' : 'opacity-50')}>
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i <= stage ? 'bg-gold text-ink' : 'bg-white/10 text-lilac')}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold tracking-tight">{s.title}</div>
              <div className="truncate text-[13px] text-body">{s.sub}</div>
            </div>
            <span className="shrink-0 font-mono text-[11.5px] text-lilac">{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
