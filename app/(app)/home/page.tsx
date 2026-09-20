'use client';
import Link from 'next/link';
import { Flag } from '@/components/brand';
import { Progress, SectionLabel } from '@/components/ui';
import { BILLS, CATEGORIES, GOALS, LESSONS, MONTH, OPPORTUNITIES, PRODUCTS, SOURCES, SUBSCRIPTIONS, WEEK, country } from '@/lib/mock-data';
import { convert, money, cn } from '@/lib/format';
import { useBanana } from '@/lib/state';

const hour = () => new Date().getHours();
const greet = () => (hour() < 12 ? 'Good morning' : hour() < 17 ? 'Good afternoon' : 'Good evening');

export default function Home() {
  const s = useBanana();
  const cur = s.user.currency;
  const m = (ngn: number, o = {}) => money(convert(ngn, 'NGN', cur), cur, o);
  const net = MONTH.income - MONTH.expenses;
  const maxWeek = Math.max(...WEEK.map((w) => Math.max(w.in, w.out)));
  const totalOut = CATEGORIES.reduce((a, c) => a + c.amount, 0);
  const nextLesson = (!s.lessons['usdc']?.done ? LESSONS.find((l) => l.slug === 'usdc') : LESSONS.find((l) => !s.lessons[l.slug]?.done)) ?? LESSONS[0];
  const bounty = OPPORTUNITIES.find((o) => o.type === 'Bounty' && o.difficulty === 'Beginner')!;
  const pick = PRODUCTS[0];
  const c = country(s.user.country);

  return (
    <div className="space-y-10">
      {/* greeting */}
      <div className="rise">
        <div className="label-mono flex items-center gap-2"><Flag code={s.user.country} /> {c.name} · {cur}</div>
        <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[56px]">
          {greet()}, <span className="font-serif italic font-normal text-lilac">{s.user.name}.</span>
        </h1>
        <p className="mt-3 text-[17px] text-body">Here’s where your money went — and where it’s going this week.</p>
      </div>

      {/* Row: net cash flow + income vs expenses */}
      <section>
        <div className="mb-3"><SectionLabel n={1} total={4} label="THIS MONTH" /></div>
        <div className="well grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <div className="card !p-6">
            <div className="text-[13.5px] font-medium text-[#7A6BAE]">Net cash flow · this month</div>
            <div className="mt-1 text-[44px] font-bold leading-none tracking-tight">{m(net, { sign: true })}</div>
            <div className="mt-1.5 text-[14px] text-[#7A6BAE]">You kept {Math.round((net / MONTH.income) * 100)}% of what came in.</div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-[14px]"><span className="font-medium">Money in</span><b className="text-[#8A6A12]">{m(MONTH.income)}</b></div>
                <div className="h-3 rounded-full bg-black/5"><div className="h-full rounded-full bg-gold" style={{ width: '100%' }} /></div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-[14px]"><span className="font-medium">Money out</span><b className="text-rose-muted">{m(MONTH.expenses)}</b></div>
                <div className="h-3 rounded-full bg-black/5"><div className="h-full rounded-full bg-rose-soft" style={{ width: `${(MONTH.expenses / MONTH.income) * 100}%` }} /></div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#6B5BA3]">
              {MONTH.incomeSources.map((i) => <span key={i.name}>{i.name} · {m(i.amount, { compact: true })}</span>)}
            </div>
          </div>

          <div className="card !p-6">
            <div className="flex items-center justify-between">
              <div className="text-[13.5px] font-medium text-[#7A6BAE]">This week</div>
              <div className="flex items-center gap-3 text-[12px] text-[#7A6BAE]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-gold" />In</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-soft" />Out</span></div>
            </div>
            <div className="mt-4 flex h-40 items-end gap-2.5">
              {WEEK.map((w) => (
                <div key={w.d} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end gap-[3px]">
                    <div className="flex-1 rounded-t-md bg-gold" style={{ height: `${Math.max(3, (w.in / maxWeek) * 100)}%` }} title={m(w.in)} />
                    <div className="flex-1 rounded-t-md bg-rose-soft" style={{ height: `${Math.max(3, (w.out / maxWeek) * 100)}%` }} title={m(w.out)} />
                  </div>
                  <span className="text-[11.5px] text-[#8A7BBF]">{w.d}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[13.5px] text-[#6B5BA3]">Thursday brought in the most: <b className="text-[#8A6A12]">{m(150_000)}</b> from a design client.</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-3"><SectionLabel n={2} total={4} label="WHERE IT WENT" /></div>
        <div className="well">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat, i) => (
              <div key={cat.name} className={i % 2 ? 'card-lilac' : 'card'}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[15.5px] font-semibold"><span className="text-[20px]">{cat.icon}</span> {cat.name}</span>
                  <b className="text-[16px]">{m(cat.amount, { compact: true })}</b>
                </div>
                <Progress className="mt-3" value={(cat.amount / totalOut) * 100 * 2.2} />
                <div className="mt-1.5 text-[12.5px] text-[#7A6BAE]">{Math.round((cat.amount / MONTH.expenses) * 100)}% of spending</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bills + accounts + goals */}
      <section>
        <div className="mb-3"><SectionLabel n={3} total={4} label="COMING UP" /></div>
        <div className="well grid gap-3 lg:grid-cols-3">
          <div className="card !p-5">
            <div className="text-[15px] font-semibold">Upcoming bills</div>
            <ul className="mt-3 divide-y divide-[#EFE8FF]">
              {BILLS[s.user.country].map((b) => (
                <li key={b.name} className="flex items-center justify-between py-2.5 text-[14.5px]">
                  <span className="flex items-center gap-2.5"><span className="text-[18px]">{b.icon}</span><span>{b.name}<span className="block text-[12px] text-[#8A7BBF]">{b.due}</span></span></span>
                  <b className="text-rose-muted">{m(b.amount, { compact: true })}</b>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-[#EFE8FF] pt-3 text-[12.5px] text-[#7A6BAE]">Subscriptions: {SUBSCRIPTIONS.map((x) => `${x.name} ${m(x.amount, { compact: true })}`).join(' · ')}</div>
          </div>

          <div className="card-lilac !p-5">
            <div className="text-[15px] font-semibold">Where your money sits</div>
            <ul className="mt-3 space-y-2.5">
              {SOURCES[s.user.country].map((src) => (
                <li key={src.name} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-[14.5px]">
                  <span>{src.name}<span className="block text-[12px] text-[#8A7BBF]">{src.kind}</span></span>
                  <b>{m(src.balance, { compact: true })}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className="card !p-5">
            <div className="text-[15px] font-semibold">Savings goals</div>
            <ul className="mt-3 space-y-4">
              {GOALS.map((g) => (
                <li key={g.name}>
                  <div className="flex items-baseline justify-between text-[14.5px]"><span className="font-medium">{g.name}</span><span className="text-[12.5px] text-[#7A6BAE]">{Math.round((g.saved / g.target) * 100)}%</span></div>
                  <Progress tone="gold" className="mt-1.5" value={(g.saved / g.target) * 100} />
                  <div className="mt-1 flex justify-between text-[12px] text-[#8A7BBF]"><span>{m(g.saved, { compact: true })} of {m(g.target, { compact: true })}</span><span>{g.note}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Modules row */}
      <section>
        <div className="mb-3"><SectionLabel n={4} total={4} label="NEXT UP" /></div>
        <div className="well grid gap-3 md:grid-cols-3">
          <Link href={`/learn/${nextLesson.slug}`} className="card group !p-5 transition hover:-translate-y-0.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">Continue lesson</div>
            <div className="mt-2 text-[20px] font-semibold leading-tight tracking-tight">{nextLesson.title}</div>
            <div className="mt-1 text-[14px] text-[#6B5BA3]">{nextLesson.minutes} min · {nextLesson.blurb}</div>
            <div className="mt-4 text-[14px] font-semibold text-violet">Resume →</div>
          </Link>
          <Link href="/earn" className="card-lilac group !p-5 transition hover:-translate-y-0.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">Open bounty</div>
            <div className="mt-2 text-[20px] font-semibold leading-tight tracking-tight">{bounty.title}</div>
            <div className="mt-1 text-[14px] text-[#6B5BA3]">${bounty.reward} in USDC · ≈ {m(bounty.reward * 1630, { compact: true })}</div>
            <div className="mt-4 text-[14px] font-semibold text-violet">See details →</div>
          </Link>
          <Link href="/market/sell" className={cn('card group !p-5 transition hover:-translate-y-0.5')}>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">Your store</div>
            <div className="mt-2 text-[20px] font-semibold leading-tight tracking-tight">banana.africa/@{s.user.handle}</div>
            <div className="mt-1 text-[14px] text-[#6B5BA3]">{s.sales.filter((x) => x.handle === s.user.handle).length === 1 ? '1 sale' : `${s.sales.filter((x) => x.handle === s.user.handle).length} sales`} · Market pick: {pick.title}</div>
            <div className="mt-4 text-[14px] font-semibold text-violet">Open seller dashboard →</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
