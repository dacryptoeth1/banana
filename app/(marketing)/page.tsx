import Link from 'next/link';
import { Backdrop, Accent, Button, SectionLabel } from '@/components/ui';
import { ProductArt, Avatar } from '@/components/brand';
import { MONTH, CATEGORIES, WEEK, LESSONS, OPPORTUNITIES, PRODUCTS } from '@/lib/mock-data';
import { money } from '@/lib/format';

function Section({ n, id, label, title, copy, cta, children, flip }: { n: number; id: string; label: string; title: string; copy: string; cta: { href: string; label: string }; children: React.ReactNode; flip?: boolean }) {
  return (
    <section id={id} className="relative mx-auto max-w-[1180px] scroll-mt-10 px-4 py-14 sm:px-6 sm:py-20">
      <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <SectionLabel n={n} total={5} label={label} />
          <h2 className="mt-4 text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[50px]">{title}</h2>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-body">{copy}</p>
          <div className="mt-7"><Button href={cta.href} variant="ghost">{cta.label} →</Button></div>
        </div>
        <div className="well">{children}</div>
      </div>
    </section>
  );
}

export default function Landing() {
  const max = Math.max(...WEEK.map((w) => Math.max(w.in, w.out)));
  return (
    <>
      {/* ------------------------------ HERO ------------------------------ */}
      <div className="relative">
        <Backdrop height={760} />
        <section className="relative mx-auto max-w-[1180px] px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="label-mono">[ 00 / 05 ] &nbsp;·&nbsp; LEARN MONEY. EARN MONEY. MOVE MONEY.</div>
          <h1 className="mx-auto mt-8 max-w-[980px] text-[46px] font-semibold leading-[1] tracking-[-0.045em] sm:text-[84px]">
            Sell across Africa
            <span className="block font-serif text-[64px] italic font-normal leading-[0.95] tracking-[-0.03em] text-lilac sm:text-[128px]"><Accent>quietly.</Accent></span>
          </h1>
          <p className="mx-auto mt-8 max-w-[760px] text-[19px] leading-relaxed text-body sm:text-[22px]">List in naira. Get paid from Accra. The customer never sees a wallet.</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button href="/signup" size="lg">Create your Banana account <span>→</span></Button>
            <Link href="/home" className="text-[14.5px] text-lilac underline decoration-white/20 underline-offset-4 hover:text-white">or look around the demo first</Link>
          </div>
        </section>
        <div className="relative mx-auto max-w-[1000px] px-4 pb-6 sm:px-6">
          <div className="well rise">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Dashboard', 'Know where it goes', '₦207,700 left this month'],
                ['Learn', 'One idea per screen', 'What’s USDC? · 3 min'],
                ['Earn', 'Real work, real pay', '$25 · Design a store banner'],
              ].map(([k, t, d]) => (
                <div key={k} className="card-lilac">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">{k}</div>
                  <div className="mt-2 text-[19px] font-semibold tracking-tight">{t}</div>
                  <div className="mt-1 text-[14px] text-[#6B5BA3]">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ 01 DASHBOARD ---------------------------- */}
      <Section n={1} id="dashboard" label="DASHBOARD" title="See your money the way you live it." copy="Bank, Opay, MTN MoMo, M-Pesa, cash — in one calm view. Airtime, transport, school fees and family support have their own place." cta={{ href: '/home', label: 'Open the dashboard' }}>
        <div className="card">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[13px] font-medium text-[#7A6BAE]">Net cash flow · this month</div>
              <div className="mt-1 text-[34px] font-bold tracking-tight">{money(MONTH.income - MONTH.expenses, 'NGN', { sign: true })}</div>
            </div>
            <span className="rounded-full bg-gold/25 px-3 py-1 text-[12.5px] font-semibold text-[#8A6A12]">Money in ↑</span>
          </div>
          <div className="mt-5 flex h-28 items-end gap-2.5">
            {WEEK.map((w) => (
              <div key={w.d} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end gap-[3px]">
                  <div className="flex-1 rounded-t-md bg-gold" style={{ height: `${Math.max(4, (w.in / max) * 100)}%` }} />
                  <div className="flex-1 rounded-t-md bg-rose-soft" style={{ height: `${Math.max(4, (w.out / max) * 100)}%` }} />
                </div>
                <span className="text-[11px] text-[#8A7BBF]">{w.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c.name} className="rounded-full bg-lilac-2 px-3 py-1 text-[13px] text-ink/80">{c.icon} {c.name}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------- 02 LEARN ----------------------------- */}
      <Section n={2} id="learn" label="LEARN MONEY" title="One idea per screen. No jargon." copy="Short lessons in plain English — inflation, scams, stablecoins. When you are ready, a Digital Wallet is one tap away. Never a leap." cta={{ href: '/learn', label: 'Start learning' }} flip>
        <div className="grid gap-3">
          {LESSONS.slice(0, 4).map((l, i) => (
            <div key={l.slug} className={i === 3 ? 'card' : 'card-lilac'}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">{['Freshman', 'Freshman', 'Sophomore', 'Sophomore'][i]} · {l.minutes} min</div>
                  <div className="mt-1.5 text-[18px] font-semibold tracking-tight">{l.title}</div>
                </div>
                <span className="rounded-full bg-violet px-3.5 py-1.5 text-[13px] font-semibold text-white">Start</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------- 03 EARN ----------------------------- */}
      <Section n={3} id="earn" label="EARN" title="Get paid for what you can already do." copy="Bounties, freelance work, grants and hackathons — from communities across Africa. Browse without an account. Get paid in USDC." cta={{ href: '/earn', label: 'Browse opportunities' }}>
        <div className="grid gap-3">
          {OPPORTUNITIES.slice(0, 3).map((o, i) => (
            <div key={o.id} className={i === 1 ? 'card' : 'card-lilac'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A7BBF]">{o.type} · {o.difficulty}</div>
                  <div className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight">{o.title}</div>
                  <div className="mt-1 text-[13.5px] text-[#6B5BA3]">{o.org} · No wallet required to browse</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[20px] font-bold">${o.reward.toLocaleString()}</div>
                  <div className="text-[12px] text-[#7A6BAE]">≈ {money(o.reward * 1630, 'NGN', { compact: true })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------------- 04 MARKET ---------------------------- */}
      <Section n={4} id="market" label="MARKET 🍌" title="Sell across Africa." copy="List in naira. Get paid from Accra. The customer pays with card or mobile money — you receive stablecoin. Nobody has to see a wallet." cta={{ href: '/store/rhydar', label: 'Visit a creator store' }} flip>
        <div className="mb-3 flex items-center gap-3 px-1">
          <Avatar name="Rhydar" size={42} />
          <div>
            <div className="text-[16px] font-semibold">Rhydar’s Store</div>
            <div className="font-mono text-[12px] text-lilac-3">banana.africa/@rhydar</div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.filter((p) => p.handle === 'rhydar').map((p, i) => (
            <div key={p.id} className={i % 3 === 0 ? 'card' : 'card-lilac'}>
              <ProductArt kind={p.art} className="h-24 rounded-xl" />
              <div className="mt-3 text-[15.5px] font-semibold leading-snug">{p.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[18px] font-bold">{money(p.price.amount, p.price.currency)}</span>
                <span className="rounded-full bg-violet px-3 py-1 text-[12.5px] font-semibold text-white">Buy</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------------- 05 WALLET ---------------------------- */}
      <Section n={5} id="wallet" label="WALLET" title="Your Digital Wallet is ready when you are." copy="Receive creator income, save, send family support and cash out to Opay, MoMo or M-Pesa. The technical details wait in Activity — if you ever want them." cta={{ href: '/wallet', label: 'See the wallet' }}>
        <div className="card">
          <div className="text-[13px] font-medium text-[#7A6BAE]">Your Digital Wallet</div>
          <div className="mt-1 text-[38px] font-bold tracking-tight">₦81,400</div>
          <div className="text-[14px] text-[#7A6BAE]">≈ 49.94 USDC</div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {['Receive', 'Send', 'Cash out'].map((a) => (
              <div key={a} className="rounded-xl bg-lilac-2 py-3 text-center text-[14px] font-semibold">{a}</div>
            ))}
          </div>
          <div className="mt-5 space-y-2 text-[14.5px]">
            <div className="flex justify-between"><span>Sale · Logo Design</span><b className="text-[#8A6A12]">+₦14,700</b></div>
            <div className="flex justify-between"><span>Family support → Mum</span><b className="text-rose-muted">−₦30,000</b></div>
          </div>
        </div>
      </Section>

      {/* ------------------------------ CTA ------------------------------- */}
      <section className="relative mx-auto max-w-[1180px] px-4 pt-16 text-center sm:px-6">
        <h2 className="text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[60px]">Start with a lesson. End with a <Accent>wallet.</Accent></h2>
        <div className="mt-9"><Button href="/signup" size="lg">Create your Banana account →</Button></div>
      </section>
    </>
  );
}
