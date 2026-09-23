import Link from 'next/link';
import { Logo, Flag } from '@/components/brand';
import { Button } from '@/components/ui';
import { AmbientBackground } from '@/components/LandingVisuals';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-x-clip">
      <AmbientBackground />
      <div className="flex h-11 items-center justify-center gap-3 border-b border-white/10 bg-[#140642]/45 px-3 text-[13.5px] text-[#E9E0FF] sm:text-[14.5px]">
        <span className="flex items-center gap-2"><Flag code="NG" /> <span className="opacity-80">→</span> <Flag code="GH" /></span>
        <b className="font-medium">Cross-border checkout is live</b>
        <Link href="/market" className="font-semibold text-white">Explore →</Link>
      </div>
      <header className="relative z-10 mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden gap-9 text-[15.5px] font-medium text-[#D8CCF5] md:flex">
          <a href="#dashboard" className="hover:text-white">Dashboard</a>
          <a href="#learn" className="hover:text-white">Learn</a>
          <a href="#earn" className="hover:text-white">Earn</a>
          <a href="#market" className="hover:text-white">Market</a>
          <a href="#wallet" className="hover:text-white">Wallet</a>
        </nav>
        <Button href="/signup" variant="light" size="sm">Sign Up</Button>
      </header>
      {children}
      <footer className="relative mx-auto mt-24 max-w-[1180px] border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[14px] text-body">
          <Logo size={28} />
          <div className="font-serif text-[22px] italic text-lilac">Learn money. Earn money. Move money. Build onchain.</div>
          <div>© 2026 Banana · Built in Africa</div>
        </div>
      </footer>
    </div>
  );
}
