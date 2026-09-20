'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Chip, PageHead, Sheet } from '@/components/ui';
import { OPPORTUNITIES, type EarnType, type Opportunity } from '@/lib/mock-data';
import { convert, money, cn } from '@/lib/format';
import { payBounty, setBounty, useBanana } from '@/lib/state';

const FILTERS: ('All' | EarnType)[] = ['All', 'Bounty', 'Hackathon', 'Freelance', 'Grant'];
const FILTER_LABEL: Record<string, string> = { All: 'All', Bounty: 'Bounties', Hackathon: 'Hackathons', Freelance: 'Freelance', Grant: 'Grants' };
const DIFF_DOT = { Beginner: 'bg-[#7CD9A8]', Intermediate: 'bg-gold', Advanced: 'bg-rose-soft' };

export default function Earn() {
  const s = useBanana();
  const [filter, setFilter] = useState<'All' | EarnType>('All');
  const [open, setOpen] = useState<Opportunity | null>(null);
  const cur = s.user.currency;
  const list = OPPORTUNITIES.filter((o) => filter === 'All' || o.type === filter);
  const local = (usd: number) => money(convert(usd, 'USD', cur), cur, { compact: true });

  return (
    <div>
      <PageHead
        label="[ 03 / 05 ] · EARN"
        title="Get paid for what you"
        accent="already do."
        sub="Bounties, freelance work, grants and hackathons from African communities. Paid in USDC, cash out to local money any time."
      />
      <div className="mb-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{FILTER_LABEL[f]}</Chip>)}
        <span className="ml-auto hidden shrink-0 text-[13px] text-lilac-3 sm:block">No wallet required to browse</span>
      </div>

      <div className="well grid gap-3 md:grid-cols-2">
        {list.map((o, i) => {
          const st = s.bounties[o.id];
          return (
            <button key={o.id} onClick={() => setOpen(o)} className={cn('group text-left transition hover:-translate-y-0.5', i % 3 === 1 ? 'card-lilac' : 'card', '!p-5')}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">{o.type}</span>
                <span className="flex items-center gap-1.5 text-[12.5px] text-[#6B5BA3]"><i className={cn('h-2 w-2 rounded-full', DIFF_DOT[o.difficulty])} />{o.difficulty}</span>
              </div>
              <div className="mt-3 text-[19px] font-semibold leading-snug tracking-tight">{o.title}</div>
              <div className="mt-1 text-[14px] text-[#6B5BA3]">{o.org} · {o.deadline}</div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-[26px] font-bold leading-none tracking-tight">${o.reward.toLocaleString()} <span className="text-[13px] font-medium text-[#7A6BAE]">USDC</span></div>
                  <div className="mt-1 text-[13px] text-[#7A6BAE]">≈ {local(o.reward)}</div>
                </div>
                {st ? <span className="rounded-full bg-gold/30 px-3 py-1 text-[12.5px] font-semibold text-[#6B4E00]">{st === 'paid' ? 'Paid ✓' : st === 'submitted' ? 'In review' : 'In progress'}</span> : <span className="text-[14px] font-semibold text-violet">Details →</span>}
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} width="max-w-[560px]">
        {open && <Detail o={open} onClose={() => setOpen(null)} />}
      </Sheet>
    </div>
  );
}

function Detail({ o, onClose }: { o: Opportunity; onClose: () => void }) {
  const s = useBanana();
  const st = s.bounties[o.id];
  const cur = s.user.currency;
  const isBounty = o.type === 'Bounty';

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">{o.type} · {o.difficulty} · {o.deadline}</div>
      <h2 className="mt-2 pr-10 text-[26px] font-semibold leading-tight tracking-[-0.03em]">{o.title}</h2>
      <div className="mt-1 text-[14.5px] text-[#6B5BA3]">{o.org}</div>
      <div className="mt-5 flex items-end gap-3 rounded-2xl bg-lilac-2 px-5 py-4">
        <div className="text-[32px] font-bold leading-none tracking-tight">${o.reward.toLocaleString()}</div>
        <div className="pb-1 text-[14px] text-[#6B5BA3]">USDC · ≈ {money(convert(o.reward, 'USD', cur), cur, { compact: true })}</div>
      </div>
      <p className="mt-5 text-[16px] leading-relaxed text-[#4C3E82]">{o.blurb}</p>
      <div className="mt-4 text-[13px] font-semibold uppercase tracking-wider text-[#8A7BBF]">What you’ll need</div>
      <ul className="mt-2 space-y-1.5 text-[15px]">
        {o.requirements.map((r) => <li key={r} className="flex gap-2"><span className="text-violet">•</span>{r}</li>)}
      </ul>

      <div className="mt-6 space-y-3">
        {!st && <Button full onClick={() => setBounty(o.id, 'started')}>{isBounty ? 'Start this bounty' : 'Apply'} →</Button>}
        {st === 'started' && <Button full onClick={() => setBounty(o.id, 'submitted')}>{isBounty ? 'Submit my work' : 'Send application'} →</Button>}
        {st === 'submitted' && (
          <>
            <div className="rounded-xl bg-lilac-2 px-4 py-3 text-[14.5px] text-[#5A4A93]">Submitted. The team reviews within a few days — we’ll notify you.</div>
            <Button full variant="soft" onClick={() => { payBounty(o.id, o.title, o.org, o.reward); onClose(); }}>Demo: fast-forward review & pay ${o.reward} →</Button>
          </>
        )}
        {st === 'paid' && (
          <div className="rounded-xl bg-gold/25 px-4 py-3 text-[14.5px] font-medium text-[#6B4E00]">Paid ✓ ${o.reward} USDC landed in your Digital Wallet. <Link href="/wallet" className="underline">Open wallet</Link></div>
        )}
        <p className="text-center text-[12.5px] text-[#9C8FCB]">You get paid in your Digital Wallet. We’ll set it up automatically when you’re paid.</p>
      </div>
    </div>
  );
}
