'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Field, PageHead, Sheet } from '@/components/ui';
import { country } from '@/lib/mock-data';
import { RATES, SYMBOL, ago, cn, convert, money, shortHash, type Currency } from '@/lib/format';
import { SMALL_SEND_LIMIT_USD, balanceUsd, cashOut, receiveDemo, revealWallet, scamLessonDone, sendMoney, useBanana, type Activity } from '@/lib/state';

type Modal = null | 'receive' | 'send' | 'cashout';

export default function WalletPage() {
  const s = useBanana();
  const cur = s.user.currency;
  const [modal, setModal] = useState<Modal>(null);
  const [receipt, setReceipt] = useState<Activity | null>(null);
  const total = balanceUsd(s);
  const local = (usd: number, o = {}) => money(convert(usd, 'USD', cur), cur, o);

  if (!s.walletRevealed) {
    return (
      <div>
        <PageHead label="[ 05 / 05 ] · WALLET" title="Meet your" accent="Digital Wallet." sub="A safe place for the money you earn. It’s set up in the background — you just haven’t needed it yet." />
        <div className="well max-w-2xl">
          <div className="card !p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac-2 text-[28px]">👛</div>
            <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.03em]">Learn first, then unlock it.</h2>
            <p className="mt-2 text-[16.5px] leading-relaxed text-[#4C3E82]">Most people find it easier once they know what USDC is. It’s a three-minute lesson — and the last screen will offer to create your wallet.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/learn/usdc">Learn: What’s USDC? →</Button>
              <Button variant="soft" onClick={() => revealWallet()}>Create my Digital Wallet now</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead label="[ 05 / 05 ] · WALLET" title="Your" accent="Digital Wallet." />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="well">
          <div className="card !p-6">
            <div className="text-[13.5px] font-medium text-[#7A6BAE]">Balance</div>
            <div className="mt-1 text-[48px] font-bold leading-none tracking-tight">{local(total, { decimals: cur === 'USD' ? 2 : 0 })}</div>
            <div className="mt-2 text-[15px] text-[#7A6BAE]">≈ {money(s.usdc, 'USD', { decimals: 2 })} USDC{s.localUsd > 0 && <> · {local(s.localUsd)} paid out as {cur}</>}{s.banana > 0 && <> · {money(s.banana, 'USD', { decimals: 2 })} Banana balance</>}</div>
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              {([['receive', 'Receive', '↓'], ['send', 'Send', '↑'], ['cashout', 'Cash out', '⇢']] as const).map(([k, label, icon]) => (
                <button key={k} onClick={() => setModal(k)} className="flex flex-col items-center gap-1.5 rounded-2xl bg-lilac-2 py-4 text-[14.5px] font-semibold transition hover:bg-lilac">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet text-[18px] text-white">{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="well">
          <div className="mb-3 flex items-center justify-between px-2 pt-1"><span className="text-[15px] font-semibold">Activity</span><span className="text-[12.5px] text-lilac">Receipts, in plain words</span></div>
          {s.activity.length === 0 ? (
            <div className="card !p-8 text-center">
              <div className="text-[36px]">🍌</div>
              <div className="mt-2 text-[18px] font-semibold tracking-tight">Your Digital Wallet is ready.</div>
              <p className="mt-1 text-[15px] text-[#6B5BA3]">You don’t need to do anything yet.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <Button size="sm" href="/store/rhydar">Visit @rhydar’s store →</Button>
                <Button size="sm" variant="soft" href="/market">Explore Market</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {s.activity.map((a) => (
                <button key={a.id} onClick={() => setReceipt(a)} className="card flex w-full items-center gap-3 !p-3.5 text-left transition hover:-translate-y-0.5">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[17px]', a.usd >= 0 ? 'bg-gold/30' : 'bg-rose-soft/30')}>{a.kind === 'sale' ? '🛍️' : a.kind === 'bounty' ? '🏆' : a.kind === 'send' ? '💌' : a.kind === 'cashout' ? '🏧' : '↓'}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{a.title}</span><span className="block truncate text-[12.5px] text-[#7A6BAE]">{a.sub} · {ago(a.at)}</span></span>
                  <span className={cn('text-[15.5px] font-bold', a.usd >= 0 ? 'text-[#8A6A12]' : 'text-rose-muted')}>{local(a.usd, { sign: true })}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* modals */}
      <Sheet open={modal === 'receive'} onClose={() => setModal(null)}><Receive onClose={() => setModal(null)} /></Sheet>
      <Sheet open={modal === 'send'} onClose={() => setModal(null)}><Send onClose={() => setModal(null)} /></Sheet>
      <Sheet open={modal === 'cashout'} onClose={() => setModal(null)}><CashOut onClose={() => setModal(null)} /></Sheet>
      <Sheet open={!!receipt} onClose={() => setReceipt(null)}>{receipt && <ReceiptView a={receipt} cur={cur} />}</Sheet>
    </div>
  );
}

/* --------------------------------- Receive -------------------------------- */
function Receive({ onClose }: { onClose: () => void }) {
  const s = useBanana();
  const [adv, setAdv] = useState(false);
  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.03em]">Receive money</h2>
      <p className="mt-1 text-[15px] text-[#6B5BA3]">Share your Banana tag — anyone can pay you, in their own currency.</p>
      <div className="mt-5 rounded-2xl bg-lilac-2 p-5 text-center">
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#8A7BBF]">Your Banana tag</div>
        <div className="mt-1 text-[26px] font-bold tracking-tight">{s.user.handle}@banana</div>
        <div className="mt-1 font-mono text-[13px] text-[#6B5BA3]">banana.africa/pay/{s.user.handle}</div>
      </div>
      <button onClick={() => setAdv((a) => !a)} className="mt-4 text-[13.5px] font-semibold text-violet">{adv ? 'Hide' : 'Show'} advanced details</button>
      {adv && <div className="pop mt-2 rounded-xl bg-lilac-2 p-3.5 font-mono text-[12.5px] text-[#5A4A93] break-all">Wallet address · 0x{s.user.handle.padEnd(8, '0').slice(0, 8)}…c41f9e<br /><span className="font-sans text-[12.5px] text-[#7A6BAE]">Only share this with someone who asked for it.</span></div>}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="soft" onClick={() => { receiveDemo(12, 'Ama (family support)'); onClose(); }}>Demo: receive $12 from family</Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ----------------------------------- Send --------------------------------- */
function Send({ onClose }: { onClose: () => void }) {
  const s = useBanana();
  const cur = s.user.currency;
  const [to, setTo] = useState('');
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('Family support');
  const [sent, setSent] = useState(false);
  const n = Number(amt.replace(/[^0-9.]/g, ''));
  const usd = n / RATES[cur];
  const limitLocal = SMALL_SEND_LIMIT_USD * RATES[cur];
  const overLimit = usd > SMALL_SEND_LIMIT_USD && !scamLessonDone(s);
  const tooMuch = usd > s.usdc + 1e-9;
  const ok = to.trim().length > 1 && n > 0 && !overLimit && !tooMuch;

  if (sent) return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[28px]">💌</div>
      <h2 className="mt-4 text-[26px] font-semibold tracking-[-0.03em]">Sent.</h2>
      <p className="mt-1 text-[15px] text-[#6B5BA3]">{money(n, cur)} is on its way to {to}. A receipt is in Activity.</p>
      <div className="mt-6"><Button onClick={onClose}>Done</Button></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.03em]">Send money</h2>
      <p className="mt-1 text-[15px] text-[#6B5BA3]">Available: {money(convert(s.usdc, 'USD', cur), cur)}</p>
      <div className="mt-5 space-y-4">
        <Field label="Who are you sending to?">
          <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Name, phone or banana tag" />
          <div className="mt-2 flex gap-2">{['Mum', 'Dad', 'My sister'].map((x) => <button key={x} type="button" onClick={() => setTo(x)} className="rounded-full bg-lilac-2 px-3 py-1 text-[13px] hover:bg-lilac">{x}</button>)}</div>
        </Field>
        <Field label={`Amount (${SYMBOL[cur as Currency]})`}><input className="input" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="20,000" /></Field>
        <Field label="Note"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
      {overLimit && (
        <div className="mt-4 rounded-xl bg-gold/25 px-4 py-3 text-[14.5px] text-[#6B4E00]">
          Sends above {money(limitLocal, cur, { compact: true })} unlock after a short lesson. <Link href="/learn/scams" className="font-semibold underline" onClick={onClose}>How do I protect myself from scams? →</Link>
        </div>
      )}
      {tooMuch && n > 0 && !overLimit && <div className="mt-4 rounded-xl bg-rose-soft/25 px-4 py-3 text-[14.5px] text-[#8A3550]">That’s more than your balance. Earn or receive some first.</div>}
      <div className="mt-6"><Button size="lg" full disabled={!ok} onClick={() => { sendMoney(usd, to.trim(), note); setSent(true); }}>Send {n > 0 ? money(n, cur) : ''}</Button></div>
      <p className="mt-3 text-center text-[12.5px] text-[#9C8FCB]">Sent money is usually hard to bring back. Double-check the name.</p>
    </div>
  );
}

/* --------------------------------- Cash out -------------------------------- */
function CashOut({ onClose }: { onClose: () => void }) {
  const s = useBanana();
  const cur = s.user.currency;
  const rails = country(s.user.country).rails.filter((r) => r !== 'Cash');
  const [dest, setDest] = useState(rails[0]);
  const [done, setDone] = useState(false);
  const max = convert(s.usdc, 'USD', cur);
  const [amt, setAmt] = useState('');
  const n = Number(amt.replace(/[^0-9.]/g, ''));
  const ok = n > 0 && n <= max + 1e-6;

  if (done) return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[28px]">🏧</div>
      <h2 className="mt-4 text-[26px] font-semibold tracking-[-0.03em]">On its way.</h2>
      <p className="mt-1 text-[15px] text-[#6B5BA3]">{money(n, cur)} is heading to {dest}. Usually arrives within minutes.</p>
      <div className="mt-6"><Button onClick={onClose}>Done</Button></div>
    </div>
  );
  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.03em]">Cash out</h2>
      <p className="mt-1 text-[15px] text-[#6B5BA3]">Turn your USDC into {cur} in your account or mobile money.</p>
      <div className="mt-5 space-y-4">
        <Field label="Send it to">
          <div className="grid grid-cols-3 gap-2">{rails.map((r) => <button key={r} type="button" onClick={() => setDest(r)} className={cn('rounded-xl px-2 py-3 text-[13.5px] font-semibold ring-1 ring-inset', dest === r ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#DCD2F5] hover:bg-lilac-2')}>{r}</button>)}</div>
        </Field>
        <Field label={`Amount (${SYMBOL[cur]})`} hint={`Up to ${money(max, cur)} available`}>
          <input className="input" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={Math.floor(max).toLocaleString()} />
          {max > 0 && <button type="button" onClick={() => setAmt(String(Math.floor(max)))} className="mt-1.5 text-[13px] font-semibold text-violet">Cash out everything</button>}
        </Field>
      </div>
      <div className="mt-6"><Button size="lg" full disabled={!ok} onClick={() => { cashOut(n / RATES[cur], dest); setDone(true); }}>Cash out {n > 0 ? money(n, cur) : ''}</Button></div>
    </div>
  );
}

/* --------------------------------- Receipt -------------------------------- */
function ReceiptView({ a, cur }: { a: Activity; cur: Currency }) {
  const [tech, setTech] = useState(false);
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">Receipt</div>
      <h2 className="mt-2 pr-10 text-[24px] font-semibold leading-tight tracking-[-0.03em]">{a.title}</h2>
      <div className={cn('mt-4 text-[36px] font-bold tracking-tight', a.usd >= 0 ? 'text-[#8A6A12]' : 'text-rose-muted')}>{money(convert(a.usd, 'USD', cur), cur, { sign: true })}</div>
      <div className="text-[14px] text-[#7A6BAE]">{money(Math.abs(a.usd), 'USD', { decimals: 2 })} · {a.asset}</div>
      <div className="mt-5 space-y-2 rounded-2xl bg-lilac-2 p-4 text-[14.5px]">
        <div className="flex justify-between"><span>Status</span><b>Complete ✓</b></div>
        <div className="flex justify-between"><span>When</span><b>{new Date(a.at).toLocaleString()}</b></div>
        <div className="flex justify-between gap-4"><span>Details</span><b className="text-right">{a.sub}</b></div>
      </div>
      <button onClick={() => setTech((t) => !t)} className="mt-4 text-[13.5px] font-semibold text-violet">{tech ? 'Hide' : 'Show'} technical details</button>
      {tech && (
        <div className="pop mt-2 space-y-1.5 rounded-xl border border-[#E5DCFA] p-3.5 text-[13px]">
          <div className="flex justify-between gap-3"><span>Transaction hash</span><b className="font-mono">{shortHash(a.ref)}</b></div>
          <div className="flex justify-between gap-3"><span>Network fee</span><b>Covered by Banana</b></div>
          <a href="#" onClick={(e) => e.preventDefault()} className="block pt-1 font-semibold text-violet underline underline-offset-2">View on explorer ↗</a>
        </div>
      )}
    </div>
  );
}
