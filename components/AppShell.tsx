'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import { Logo, Flag, Avatar } from './brand';
import { COUNTRIES } from '@/lib/mock-data';
import { RATES, SYMBOL, cn, type Currency } from '@/lib/format';
import { resetDemo, setCurrency, switchRole, useBanana } from '@/lib/state';
import { isLive } from '@/lib/mode';

const TABS = [
  { href: '/home', label: 'Home', icon: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { href: '/learn', label: 'Learn', icon: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13' },
  { href: '/earn', label: 'Earn', icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z' },
  { href: '/market', label: 'Market', icon: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2' },
  { href: '/wallet', label: 'Wallet', icon: 'M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2zM16 14h2' },
];

const isActive = (path: string, href: string) => path === href || path.startsWith(href + '/') || (href === '/market' && path.startsWith('/store'));

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const s = useBanana();
  const [menu, setMenu] = useState(false);

  async function handleSignOut() {
    setMenu(false);
    await signOut({ redirect: false });
    resetDemo(); // this browser's wallet and lessons belong to the account that just left
    router.push('/');
  }

  return (
    <div className="relative min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#3A1C86]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <Logo href="/home" size={30} />
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className={cn('rounded-full px-4 py-2 text-[15px] font-medium transition', isActive(path, t.href) ? 'bg-white text-ink' : 'text-lilac hover:bg-white/10 hover:text-white')}>
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="relative flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] ring-1 ring-inset ring-white/15 sm:flex">
              <Flag code={s.user.country} /> {s.role === 'seller' ? 'Seller' : 'Buyer'} · {SYMBOL[s.user.currency]} {s.user.currency}
            </span>
            <button onClick={() => setMenu((m) => !m)} aria-label="Account menu"><Avatar name={s.user.name} size={38} /></button>
            {menu && (
              <div className="pop absolute right-0 top-12 z-50 w-72 rounded-2xl bg-white p-4 text-ink shadow-[0_30px_60px_-20px_rgba(10,0,50,.7)]">
                <div className="flex items-center gap-3">
                  <Avatar name={s.user.name} size={40} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{s.user.name}</div>
                    <div className="truncate text-[13px] text-[#7A6BAE]">{s.user.email}</div>
                  </div>
                </div>
                {!isLive && (<>
                <div className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-[#8A7BBF]">Demo</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([['seller', 'NG', 'Seller', 'Nigeria · ₦'], ['buyer', 'GH', 'Buyer', 'Ghana · GH₵']] as const).map(([r, code, label, sub]) => (
                    <button key={r} onClick={() => { switchRole(r); setMenu(false); }} className={cn('rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition', s.role === r ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#E5DCFA] hover:bg-lilac-2')}>
                      <span className="flex items-center gap-2 text-[14.5px] font-semibold"><Flag code={code} className="h-[12px] w-[18px]" />{label}</span>
                      <span className="mt-0.5 block text-[12px] text-[#7A6BAE]">{sub}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { resetDemo(); setMenu(false); router.push('/'); }} className="mt-2 w-full rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-[#B0456A] ring-1 ring-inset ring-[#F0D5DE] hover:bg-[#FFF3F6]">Reset demo</button>
                </>)}
                <div className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-[#8A7BBF]">Country and currency</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['NGN', 'GHS', 'KES', 'ZAR'] as Currency[]).map((c) => (
                    <button key={c} onClick={() => setCurrency(c)} className={cn('rounded-xl px-3 py-2 text-left text-[14px] ring-1 ring-inset', s.user.currency === c ? 'bg-lilac-2 ring-violet' : 'ring-[#E5DCFA] hover:bg-lilac-2')}>
                      {SYMBOL[c]} {c}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-[12.5px] text-[#7A6BAE]">Rates are demo values ({SYMBOL.NGN}{RATES.NGN.toLocaleString()} ≈ $1).</div>
                <div className="mt-3 flex flex-col gap-1 border-t border-[#EDE6FF] pt-3 text-[14px]">
                  <Link href="/" onClick={() => setMenu(false)} className="rounded-lg px-2 py-2 hover:bg-lilac-2">Marketing site</Link>
                  {isLive && <button onClick={handleSignOut} className="rounded-lg px-2 py-2 text-left font-semibold text-[#B0456A] hover:bg-[#FFF3F6]">Sign out</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#361A80]/90 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {TABS.map((t) => {
            const active = isActive(path, t.href);
            return (
              <Link key={t.href} href={t.href} className={cn('flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11.5px] font-medium', active ? 'text-white' : 'text-lilac-3')}>
                <span className={cn('flex h-8 w-12 items-center justify-center rounded-full transition', active && 'bg-violet')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export { COUNTRIES };
