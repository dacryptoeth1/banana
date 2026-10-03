'use client';
import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Button } from './ui';
import { ESCROW_STEPS, escrowCall } from '@/lib/escrow';
import { cn, money } from '@/lib/format';
import { isLive } from '@/lib/mode';
import { spring } from '@/lib/motion';
import { escrowDelivered, escrowHeld, escrowRefunded, escrowReleaseFailed, escrowReleased, useBanana, type Sale } from '@/lib/state';

const fmtLeft = (ms: number) => { const t = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const body = (x: Sale) => ({ saleId: x.id, heldAt: x.escrow!.heldAt, seller: x.handle, amountUsd: x.netUsd });

/** Hold the payment (deposit). Called once, right after a Creator Service is paid for. Safe to call again on failure. */
export async function holdEscrow(x: Sale) {
  const r = await escrowCall('hold', body(x));
  if (r.ok) escrowHeld(x.id, r.tx);
  return r;
}

/**
 * Plain words only: "Payment held safely" → "Delivered" → "Paid to creator".
 * The buyer confirms delivery; Banana releases the payment. Reads the live sale, so every screen stays in sync.
 */
export function EscrowTracker({ saleId, compact }: { saleId: string; compact?: boolean }) {
  const s = useBanana();
  const sale = s.sales.find((x) => x.id === saleId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [opensAt, setOpensAt] = useState<number | null>(null); // testnet: when the onchain refund window opens
  const [now, setNow] = useState(() => Date.now());

  // Testnet only: the contract enforces the refund timeout, so count down and refund the moment it opens.
  useEffect(() => {
    if (!opensAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [opensAt]);
  useEffect(() => {
    if (opensAt && now >= opensAt + 1500 && !busy) { setOpensAt(null); void skipAhead(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, opensAt]);

  if (!sale?.escrow) return null;
  const e = sale.escrow;

  const isOwner = s.user.handle === sale.handle;
  const canConfirm = !isOwner || sale.buyerEmail === s.user.email; // the buyer (or a creator testing their own store)
  const step = e.status === 'held' ? 0 : e.status === 'delivered' ? 1 : e.status === 'released' ? 2 : -1;
  const refunded = e.status === 'refunded';

  async function confirm() {
    if (!sale) return;
    setBusy(true); setError('');
    if (!sale.escrow?.hold) {
      const h = await holdEscrow(sale); // the hold never landed (offline at checkout): secure it first
      if (!h.ok) { setError(h.error); setBusy(false); return; }
    }
    escrowDelivered(sale.id);
    const r = await escrowCall('release', body(sale));
    if (r.ok) escrowReleased(sale.id, r.tx);
    else { escrowReleaseFailed(sale.id); setError(r.error); }
    setBusy(false);
  }

  async function skipAhead() {
    if (!sale) return;
    setBusy(true); setError('');
    const r = await escrowCall('refund', body(sale));
    if (r.ok) escrowRefunded(sale.id, r.tx);
    else if (r.refundableAt) { setOpensAt(r.refundableAt); setNow(Date.now()); } // testnet: wait for the window
    else setError(r.error);
    setBusy(false);
  }

  return (
    <div className={cn('rounded-2xl bg-lilac-2 text-left text-ink', compact ? 'p-3.5' : 'p-4')}>
      {refunded ? (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[17px]">↩</span>
          <div>
            <div className="text-[15px] font-semibold">Refunded</div>
            <div className="text-[13px] text-[#6B5BA3]">It wasn’t delivered in time, so {money(sale.grossUsd, 'USD', { decimals: 2 })} went back to the buyer’s {sale.method}.</div>
          </div>
        </div>
      ) : (
        <>
          <ol className="relative grid grid-cols-3" aria-label="Order progress">
            {/* track */}
            <div aria-hidden className="absolute left-[16.66%] right-[16.66%] top-[13px] h-[3px] rounded-full bg-white">
              <m.div className="h-full origin-left rounded-full bg-gold" initial={false} animate={{ scaleX: step / 2 }} transition={spring} />
            </div>
            {ESCROW_STEPS.map((label, i) => {
              const done = i < step || step === 2;
              const current = i === step && step !== 2;
              return (
                <li key={label} className="relative flex flex-col items-center gap-1.5 text-center" aria-current={current ? 'step' : undefined}>
                  <m.span
                    className={cn('relative flex h-[29px] w-[29px] items-center justify-center rounded-full text-[13px] font-bold ring-4 ring-lilac-2', done ? 'bg-gold text-ink' : current ? 'bg-violet text-white' : 'bg-white text-[#9C8FCB]')}
                    initial={false}
                    animate={{ scale: current ? 1.08 : 1 }}
                    transition={spring}
                  >
                    {done ? '✓' : i + 1}
                    {current && <span className="absolute inset-0 animate-ping rounded-full bg-violet/30 motion-reduce:hidden" />}
                  </m.span>
                  <span className={cn('text-[12px] font-semibold leading-tight', i <= step ? 'text-ink' : 'text-[#9C8FCB]')}>{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-3.5 text-[13.5px] leading-snug text-[#5A4A93]">
            {e.status === 'held' && (canConfirm
              ? <>Your {money(sale.grossUsd, 'USD', { decimals: 2 })} is held safely. We pay @{sale.handle} when you confirm the work is delivered.</>
              : <>The buyer’s payment is held safely. You’ll be paid {money(sale.netUsd, 'USD', { decimals: 2 })} as soon as they confirm delivery.</>)}
            {e.status === 'delivered' && <>Delivered. Paying @{sale.handle} now…</>}
            {e.status === 'released' && <>Paid to @{sale.handle}: {money(sale.netUsd, 'USD', { decimals: 2 })}. Thanks for confirming.</>}
          </div>

          {e.status === 'held' && canConfirm && (
            <div className="mt-3">
              <Button full size={compact ? 'md' : 'lg'} disabled={busy} onClick={confirm}>{busy ? 'Confirming…' : 'Confirm delivery'}</Button>
              <p className="mt-2 text-center text-[12px] text-[#7A6BAE]">Not delivered within 7 days? You’re refunded automatically.</p>
              {!isLive && (
                opensAt ? (
                  <p className="mt-1 text-center text-[11.5px] text-[#9C8FCB]">Refund opens onchain in {fmtLeft(opensAt - now)} (10-minute test window). It runs automatically.</p>
                ) : (
                  <button onClick={skipAhead} disabled={busy} className="mx-auto mt-1 block text-[11.5px] text-[#9C8FCB] underline underline-offset-2 hover:text-[#5A4A93]">Demo: skip ahead 7 days (no delivery)</button>
                )
              )}
            </div>
          )}
          {e.status === 'delivered' && <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-violet"><span className="h-4 w-4 animate-spin rounded-full border-2 border-violet/30 border-t-violet" /> Releasing payment</div>}
        </>
      )}
      {error && <div role="alert" className="mt-2 text-[13px] font-medium text-[#B0456A]">{error}</div>}
    </div>
  );
}
