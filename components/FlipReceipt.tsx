'use client';
import { useState, type ReactNode } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { NETWORK, explorerTx, shortTx, type ChainInfo } from '@/lib/chain';
import { cn } from '@/lib/format';
import { spring } from '@/lib/motion';

export type ReceiptRow = [label: string, value: ReactNode];

/**
 * "Show me the receipt." Plain words on the front; flip it over for the onchain view.
 * The flip is a rotateY on one element. With reduced motion the faces crossfade instead.
 * Both faces share one grid cell, so the card is always as tall as the taller face (no layout jump).
 */
export function FlipReceipt({ amount, amountSub, rows, chain, settled }: {
  amount: ReactNode;
  amountSub?: ReactNode;
  rows: ReceiptRow[];
  chain: ChainInfo;
  /** What landed onchain, e.g. "9.02 USDC". */
  settled: string;
}) {
  const [onchain, setOnchain] = useState(false);
  const reduced = useReducedMotion();

  const face = 'col-start-1 row-start-1 rounded-[20px] p-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]';
  const hidden = (back: boolean) => (back ? !onchain : onchain);

  return (
    <div className="text-left">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#5A4A93]">Receipt</span>
        <div role="group" aria-label="Receipt view" className="flex rounded-full bg-lilac-2 p-0.5 text-[12.5px] font-semibold">
          {(['Plain', 'Onchain'] as const).map((label) => {
            const on = (label === 'Onchain') === onchain;
            return (
              <button key={label} aria-pressed={on} onClick={() => setOnchain(label === 'Onchain')} className={cn('rounded-full px-3 py-1 transition-colors', on ? 'bg-white text-ink shadow-sm' : 'text-[#7A6BAE]')}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ perspective: 1200 }}>
        <m.div
          className="grid"
          style={{ transformStyle: 'preserve-3d' }}
          animate={reduced ? undefined : { rotateY: onchain ? 180 : 0 }}
          transition={spring}
        >
          {/* front: plain words */}
          <m.div
            className={cn(face, 'border border-[#EDE6FF] bg-white text-[14px] text-[#4C3E82]')}
            animate={reduced ? { opacity: onchain ? 0 : 1 } : undefined}
            transition={{ duration: 0.25 }}
            aria-hidden={hidden(false)}
            style={{ pointerEvents: hidden(false) ? 'none' : undefined }}
          >
            <div className="text-[26px] font-bold leading-none tracking-tight text-ink">{amount}</div>
            {amountSub && <div className="mt-1 text-[12.5px] text-[#7A6BAE]">{amountSub}</div>}
            <div className="mt-3.5 space-y-1.5">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><span>{k}</span><b className="text-right">{v}</b></div>
              ))}
            </div>
            <button onClick={() => setOnchain(true)} className="mt-3.5 text-[13px] font-semibold text-violet">Show me the receipt onchain ↻</button>
          </m.div>

          {/* back: the basement */}
          <m.div
            className={cn(face, 'bg-ink font-mono text-[12.5px] text-lilac')}
            style={{ transform: reduced ? undefined : 'rotateY(180deg)', pointerEvents: hidden(true) ? 'none' : undefined }}
            initial={reduced ? { opacity: 0 } : false}
            animate={reduced ? { opacity: onchain ? 1 : 0 } : undefined}
            transition={{ duration: 0.25 }}
            aria-hidden={hidden(true)}
          >
            <OnchainFace chain={chain} settled={settled} onBack={() => setOnchain(false)} />
          </m.div>
        </m.div>
      </div>
    </div>
  );
}

function OnchainFace({ chain, settled, onBack }: { chain: ChainInfo; settled: string; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(chain.hash); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const t = new Date(chain.settledAt);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-lilac-3"><span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />{NETWORK}</span>
        {chain.sample && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lilac-3" title="Demo mode: illustrative details, not a real transaction">Sample data</span>}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-lilac-3">Transaction</div>
      <button onClick={copy} className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl bg-white/[0.07] px-3 py-2 text-left text-white hover:bg-white/10" aria-label="Copy transaction hash">
        <span className="truncate">{shortTx(chain.hash)}</span>
        <span className="shrink-0 font-sans text-[11.5px] font-semibold text-gold">{copied ? 'Copied ✓' : 'Copy'}</span>
      </button>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between gap-3"><span className="text-lilac-3">Block</span><span className="text-white">#{chain.block.toLocaleString('en-US')}</span></div>
        <div className="flex justify-between gap-3"><span className="text-lilac-3">Settled</span><span className="text-right text-white">{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {t.toLocaleDateString([], { day: 'numeric', month: 'short' })}</span></div>
        <div className="flex justify-between gap-3"><span className="text-lilac-3">Amount</span><span className="text-gold">{settled}</span></div>
        <div className="flex justify-between gap-3"><span className="text-lilac-3">Network fee</span><span className="text-white">Covered by Banana</span></div>
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-3 font-sans">
        {chain.sample ? (
          // Sample hashes don't exist onchain, so never link them: an explorer "not found" on stage is worse than no link.
          <span aria-disabled className="text-[11.5px] leading-snug text-lilac-3/80">Sample receipt · goes live with testnet settlement</span>
        ) : (
          <a href={explorerTx(chain.hash)} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-gold underline decoration-gold/40 underline-offset-2">View on MonadScan ↗</a>
        )}
        <button onClick={onBack} className="shrink-0 text-[12.5px] font-semibold text-lilac hover:text-white">↺ Plain view</button>
      </div>
    </div>
  );
}
