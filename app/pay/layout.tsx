import { Logo } from '@/components/brand';

/** Pay links open from WhatsApp on a phone: no app chrome, just the product and the pay buttons. */
export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="hero-mesh pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto max-w-[460px] px-4 pb-12">
        <header className="flex h-16 items-center justify-between">
          <Logo size={28} />
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-medium text-lilac ring-1 ring-inset ring-white/15">🔒 Secure checkout</span>
        </header>
        <main className="page-enter">{children}</main>
      </div>
    </div>
  );
}
