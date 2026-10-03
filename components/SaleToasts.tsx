'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Flag, ProductArt } from './brand';
import type { ArtKind, CountryCode } from '@/lib/mock-data';
import { cn } from '@/lib/format';
import { spring } from '@/lib/motion';

// Illustrative sample sales from the demo catalogue; the toast says "Demo" so nobody mistakes them for real volume.
const SALES: { cc: CountryCode; city: string; product: string; method: string; art: ArtKind }[] = [
  { cc: 'GH', city: 'Accra', product: 'Logo Design', method: 'MoMo', art: 'logo' },
  { cc: 'KE', city: 'Nairobi', product: 'Growth Playbook', method: 'M-Pesa', art: 'chart' },
  { cc: 'NG', city: 'Lagos', product: 'Brand Story Template', method: 'card', art: 'course' },
  { cc: 'ZA', city: 'Johannesburg', product: 'Starter Skin Pack', method: 'Capitec Pay', art: 'game' },
  { cc: 'GH', city: 'Kumasi', product: 'Web3 Community Kit', method: 'MoMo', art: 'kit' },
  { cc: 'KE', city: 'Mombasa', product: 'Night Market pass', method: 'M-Pesa', art: 'ticket' },
  { cc: 'NG', city: 'Abuja', product: 'Community Management', method: 'Opay', art: 'people' },
];
const COUNTRY: Record<CountryCode, string> = { NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya', ZA: 'South Africa' };
const SHOW = 3800;
const GAP = 2600;
const KEY = 'banana-toasts-off';

/** Auto-cycling "someone just bought" toasts. Pauses while the tab is hidden; dismissable for the session. */
export function SaleToasts({ className }: { className?: string }) {
  const [i, setI] = useState(-1); // -1 = nothing showing
  const [off, setOff] = useState(true);

  useEffect(() => {
    try { setOff(sessionStorage.getItem(KEY) === '1'); } catch { setOff(false); }
  }, []);

  useEffect(() => {
    if (off) return;
    let n = 0;
    let t: ReturnType<typeof setTimeout>;
    const show = () => {
      if (document.visibilityState !== 'visible') { t = setTimeout(show, GAP); return; }
      setI(n++ % SALES.length);
      t = setTimeout(() => { setI(-1); t = setTimeout(show, GAP); }, SHOW);
    };
    t = setTimeout(show, 3000);
    return () => clearTimeout(t);
  }, [off]);

  const dismiss = () => {
    setOff(true); setI(-1);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode: dismiss for this page only */ }
  };

  const s = i >= 0 ? SALES[i] : null;
  return (
    <div className={cn('pointer-events-none fixed left-3 right-3 z-30 sm:left-5 sm:right-auto sm:w-[340px]', className ?? 'bottom-4 sm:bottom-5')} aria-live="off">
      <AnimatePresence>
        {s && !off && (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-2 text-ink shadow-[0_24px_50px_-18px_rgba(10,0,50,.7)]"
          >
            <ProductArt kind={s.art} className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[13.5px] font-semibold leading-snug">
                <Flag code={s.cc} className="mr-1.5 inline-block h-[10px] w-[15px] align-[-1px]" />A buyer in {COUNTRY[s.cc]} bought {s.product}
              </div>
              <div className="truncate text-[12px] text-[#6B5BA3]">{s.city} · paid with {s.method} · just now</div>
            </div>
            <span className="self-start rounded-full bg-lilac-2 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[#8A7BBF]">Demo</span>
            <button onClick={dismiss} aria-label="Hide sale notifications" className="self-start px-1 text-[13px] leading-none text-[#9C8FCB] hover:text-ink">✕</button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
