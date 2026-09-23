'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BananaMark, Flag, ProductArt } from './brand';
import { useReducedMotion } from './motion';
import type { ArtKind, CountryCode } from '@/lib/mock-data';
import { cn } from '@/lib/format';

/** Pauses CSS animations inside `ref` while it is off screen or the tab is hidden. Returns whether it is running. */
function useRunWhileVisible(ref: React.RefObject<Element | null>) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => setRunning(inView && document.visibilityState === 'visible');
    const obs = new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); });
    obs.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { obs.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [ref]);
  return running;
}

/* ------------------------------ Hero float layer --------------------------- */
const FLOAT_CARDS: { label: string; sub: string; art: ArtKind; pos: CSSProperties; depth: number; rot: number; dur: number; delay: number }[] = [
  { label: 'Digital Product', sub: 'Instant delivery', art: 'kit', pos: { left: '2.5%', top: 150 }, depth: 18, rot: -5, dur: 9, delay: 0.2 },
  { label: 'Online Course', sub: 'Learn at your pace', art: 'course', pos: { left: '5.5%', top: 400 }, depth: 10, rot: 3, dur: 11, delay: 0.5 },
  { label: 'Design Template', sub: 'Figma · Notion', art: 'logo', pos: { right: '3%', top: 110 }, depth: 24, rot: 4, dur: 10, delay: 0.35 },
  { label: 'Creator Service', sub: 'Book a creator', art: 'people', pos: { right: '6.5%', top: 320 }, depth: 14, rot: -3, dur: 12, delay: 0.65 },
  { label: 'Event Ticket', sub: 'QR delivered', art: 'ticket', pos: { right: '1.5%', top: 505 }, depth: 8, rot: 2, dur: 10.5, delay: 0.8 },
];

// Fixed positions so server and client markup match. The first six also show on phones.
const PARTICLES = [
  [8, 22, 3, 18], [22, 64, 2, 24], [41, 12, 2, 21], [63, 30, 3, 26], [78, 58, 2, 19], [92, 18, 3, 23],
  [15, 44, 2, 28], [34, 78, 3, 22], [52, 50, 2, 30], [70, 84, 2, 25], [86, 40, 2, 27], [4, 72, 2, 20],
];

export function HeroFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const running = useRunWhileVisible(ref);
  const reduced = useReducedMotion();

  // Cursor parallax: desktop with a fine pointer only. One rAF per frame at most; CSS smooths the rest.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !running || !matchMedia('(pointer: fine) and (min-width: 1280px)').matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      x = (e.clientX / innerWidth) * 2 - 1;
      y = (e.clientY / innerHeight) * 2 - 1;
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [reduced, running]);

  return (
    <div ref={ref} aria-hidden className={cn('hero-float pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden', !running && 'is-paused')}>
      {PARTICLES.map(([l, t, s, d], i) => (
        <span
          key={i}
          className={cn('particle', i >= 6 && 'hidden sm:block')}
          style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, '--dur': `${d}s`, '--delay': `${-i * 2.3}s`, '--dx': `${i % 2 ? 18 : -14}px` } as CSSProperties}
        />
      ))}

      <div className="relative mx-auto hidden h-full max-w-[1440px] xl:block">
        {FLOAT_CARDS.map((c) => (
          <div key={c.label} className="parallax float-enter absolute" style={{ ...c.pos, '--depth': c.depth, animationDelay: `${c.delay}s` } as CSSProperties}>
            <div className="float-bob" style={{ '--dur': `${c.dur}s`, '--delay': `${-c.delay * 4}s` } as CSSProperties}>
              <div className="flex w-[196px] items-center gap-3 rounded-2xl bg-white/[0.09] p-2.5 pr-3.5 ring-1 ring-inset ring-white/15 shadow-[0_24px_40px_-24px_rgba(10,0,50,.8)]" style={{ transform: `rotate(${c.rot}deg)` }}>
                <ProductArt kind={c.art} className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0 text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-lilac-3">{c.label}</div>
                  <div className="mt-0.5 truncate text-[13px] font-medium text-white/85">{c.sub}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="parallax float-enter absolute" style={{ left: '14%', top: 60, '--depth': 30, animationDelay: '1s' } as CSSProperties}>
          <div className="float-bob opacity-60" style={{ '--dur': '13s' } as CSSProperties}><BananaMark size={26} /></div>
        </div>
        <div className="parallax float-enter absolute" style={{ right: '15%', top: 470, '--depth': 34, animationDelay: '1.2s' } as CSSProperties}>
          <div className="float-bob opacity-50" style={{ '--dur': '15s', '--delay': '-5s' } as CSSProperties}><BananaMark size={22} /></div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Africa network + feed ------------------------- */
type Hub = { cc: CountryCode; city: string; x: number; y: number; label: { dx: number; dy: number; anchor: 'start' | 'end' } };
const HUBS: Hub[] = [
  { cc: 'NG', city: 'Lagos', x: 117, y: 158, label: { dx: 9, dy: -8, anchor: 'start' } },
  { cc: 'GH', city: 'Accra', x: 99, y: 162, label: { dx: -9, dy: 4, anchor: 'end' } },
  { cc: 'KE', city: 'Nairobi', x: 284, y: 197, label: { dx: 10, dy: 4, anchor: 'start' } },
  { cc: 'ZA', city: 'Johannesburg', x: 240, y: 321, label: { dx: 10, dy: 4, anchor: 'start' } },
];
const ARCS = ['M99 162Q108 140 117 158', 'M117 158Q196 112 284 197', 'M117 158Q196 250 240 321', 'M284 197Q300 268 240 321'];
// Unlabelled, decorative: the rest of the continent.
const FAINT = [[256, 40], [62, 22], [13, 117], [80, 164], [177, 212], [166, 234], [294, 145], [251, 200], [297, 224], [242, 267]];
const AFRICA =
  'M71 11L90 14L115 6L150 4L155 5L153 20L158 25L175 29L198 39L200 28L225 31L245 35L262 34L263 41L273 60L285 85L293 100L298 113L316 127L320 138L356 131L355 138L345 160L330 180L308 199L298 213L295 225L302 243L303 263L285 280L277 300L264 320L263 333L255 339L240 355L228 360L200 364L192 362L190 350L183 333L173 305L159 277L166 250L161 220L145 195L148 171L143 168L130 169L115 158L100 162L90 166L63 168L50 158L34 148L25 135L13 117L18 93L15 85L25 68L35 52L51 43L53 28L66 20ZM347 250L353 268L348 275L338 313L325 318L318 300L322 271L335 266Z';

// Illustrative only: built from the demo catalogue, never presented as real transactions.
const ACTIVITY: { cc: CountryCode; text: string; sub: string; art: ArtKind }[] = [
  { cc: 'GH', text: 'A buyer in Ghana bought Logo Design', sub: 'Paid with MoMo · creator settled in USDC', art: 'logo' },
  { cc: 'NG', text: '@rhydar listed Web3 Community Templates', sub: 'Templates · Lagos', art: 'kit' },
  { cc: 'KE', text: 'Night Market · Nairobi pass sold', sub: 'Tickets · delivered as a QR code', art: 'ticket' },
  { cc: 'GH', text: 'New creator joined from Accra', sub: 'Store opened · Designs', art: 'people' },
  { cc: 'ZA', text: '@thabo listed Starter Skin Pack', sub: 'Gaming items · Johannesburg', art: 'game' },
  { cc: 'NG', text: 'A buyer in Nigeria bought Growth Playbook', sub: 'Paid by card · creator settled in USDC', art: 'chart' },
  { cc: 'KE', text: 'New service listed from Nairobi', sub: 'Services · Kenya', art: 'people' },
  { cc: 'GH', text: '@amara listed Brand Story Template', sub: 'Templates · Accra', art: 'course' },
];

export function MarketPulse() {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const running = useRunWhileVisible(ref);
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!running) { svg.current?.pauseAnimations?.(); return; }
    svg.current?.unpauseAnimations?.();
    const t = setInterval(() => setI((n) => (n + 1) % ACTIVITY.length), reduced ? 6000 : 3600);
    return () => clearInterval(t);
  }, [running, reduced]);

  const item = ACTIVITY[i];
  return (
    <div ref={ref} className={cn('market-pulse', !running && 'is-paused')}>
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <span className="live-dot" aria-hidden />
          Live on Banana Market
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-lilac-3 ring-1 ring-inset ring-white/15" title="Sample activity for illustration, not real transactions">
          Demo feed
        </span>
      </div>

      <div className="relative mt-3">
        <svg ref={svg} viewBox="-12 -6 384 380" className="mx-auto block w-full max-w-[420px]" role="img" aria-label="Map of Africa linking creators and buyers in Lagos, Accra, Nairobi and Johannesburg">
          <defs>
            <pattern id="bm-dots" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="3.5" cy="3.5" r="1.25" fill="#D9C8FF" opacity=".42" />
            </pattern>
            <radialGradient id="bm-glow">
              <stop offset="0" stopColor="#FFC93C" stopOpacity=".55" />
              <stop offset="1" stopColor="#FFC93C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={AFRICA} fill="url(#bm-dots)" />
          <path d={AFRICA} fill="none" stroke="#D9C8FF" strokeOpacity=".22" strokeWidth="1" strokeLinejoin="round" />

          {FAINT.map(([x, y], k) => (
            <circle key={k} className="twinkle" cx={x} cy={y} r="1.8" fill="#fff" style={{ animationDelay: `${-k * 0.9}s` }} />
          ))}

          {ARCS.map((d, k) => (
            <g key={d}>
              <path d={d} fill="none" stroke="#9B6BFF" strokeOpacity=".35" strokeWidth="1.2" />
              <path d={d} fill="none" stroke="#FFC93C" strokeOpacity=".75" strokeWidth="1.4" strokeLinecap="round" className="arc-flow" style={{ animationDelay: `${-k * 1.1}s` }} />
              {!reduced && (
                <circle r="2.6" fill="#FFE39A">
                  <animateMotion dur={`${4.4 + k * 0.7}s`} begin={`${-k * 1.3}s`} repeatCount="indefinite" path={d} keyPoints={k % 2 ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" />
                </circle>
              )}
            </g>
          ))}

          {HUBS.map((h) => {
            const on = h.cc === item.cc;
            return (
              <g key={h.cc}>
                <circle cx={h.x} cy={h.y} r="16" fill="url(#bm-glow)" className={cn('hub-glow', on && 'is-on')} />
                <circle cx={h.x} cy={h.y} r="5" fill="none" stroke="#FFC93C" strokeWidth="1.2" className="hub-ring" />
                {on && <circle key={i} cx={h.x} cy={h.y} r="5" fill="none" stroke="#FFE39A" strokeWidth="1.4" className="hub-ping" />}
                <circle cx={h.x} cy={h.y} r="3.6" fill={on ? '#FFE39A' : '#FFC93C'} />
                <text x={h.x + h.label.dx} y={h.y + h.label.dy} textAnchor={h.label.anchor} className="fill-white font-mono text-[9.5px]" style={{ opacity: on ? 1 : 0.7 }}>
                  {h.city}
                </text>
              </g>
            );
          })}
        </svg>

        {/* The feed sits in the empty Atlantic corner on wider screens, under the map on phones. */}
        <div className="mt-3 h-[84px] sm:absolute sm:-bottom-1 sm:left-0 sm:mt-0 sm:w-[300px]" aria-live="off">
          <div key={i} className="activity-card flex h-full items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 text-ink shadow-card">
            <ProductArt kind={item.art} className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <div className="line-clamp-2 text-[13.5px] font-semibold leading-snug">
                <Flag code={item.cc} className="mr-1.5 inline-block h-[10px] w-[15px] align-[-1px]" />
                {item.text}
              </div>
              <div className="mt-0.5 line-clamp-1 text-[12px] text-[#6B5BA3]">{item.sub}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
