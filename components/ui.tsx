'use client';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/format';

/* ---------------------------------- Button -------------------------------- */
type BtnProps = {
  children: ReactNode;
  variant?: 'primary' | 'light' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  full?: boolean;
};
export function Button({ children, variant = 'primary', size = 'md', href, onClick, disabled, type = 'button', className, full }: BtnProps) {
  const sizes = { sm: 'px-4 py-2 text-[13.5px]', md: 'px-6 py-3 text-[15.5px]', lg: 'px-8 py-[18px] text-[18px]' }[size];
  const variants = {
    primary: 'btn-primary bg-violet text-white shadow-cta ring-1 ring-inset ring-white/20 hover:bg-violet-soft',
    light: 'bg-white text-ink shadow-[0_8px_20px_-8px_rgba(10,0,50,.5)] hover:bg-lilac-2',
    ghost: 'text-white/90 ring-1 ring-inset ring-white/25 hover:bg-white/10',
    soft: 'bg-lilac-2 text-ink hover:bg-lilac',
  }[variant];
  const cls = cn('btn', sizes, variants, full && 'w-full', className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

/* ---------------------------- Section label -------------------------------- */
export function SectionLabel({ n, total, label }: { n: number; total: number; label: string }) {
  const pad = (x: number) => String(x).padStart(2, '0');
  return <div className="label-mono">[ {pad(n)} / {pad(total)} ] &nbsp;·&nbsp; {label}</div>;
}

export function Chip({ children, active, onClick, tone = 'dark' }: { children: ReactNode; active?: boolean; onClick?: () => void; tone?: 'dark' | 'light' }) {
  const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition';
  const cls =
    tone === 'dark'
      ? active ? 'bg-white text-ink' : 'bg-white/10 text-white/85 ring-1 ring-inset ring-white/15 hover:bg-white/15'
      : active ? 'bg-violet text-white' : 'bg-lilac-2 text-ink/80 hover:bg-lilac';
  return onClick ? <button onClick={onClick} className={cn(base, cls)}>{children}</button> : <span className={cn(base, cls)}>{children}</span>;
}

export function Progress({ value, tone = 'violet', className }: { value: number; tone?: 'violet' | 'gold'; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-black/10', className)}>
      <div className={cn('h-full rounded-full transition-all', tone === 'gold' ? 'bg-gold' : 'bg-violet')} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ----------------------------------- Sheet -------------------------------- */
export function Sheet({ open, onClose, children, width = 'max-w-[520px]' }: { open: boolean; onClose: () => void; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-[#1a0850]/60 backdrop-blur-md" onClick={onClose} />
      <div className={cn('pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 text-ink shadow-[0_50px_90px_-20px_rgba(10,0,50,.75)] sm:m-4 sm:rounded-[28px]', width)}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-lilac-2 text-ink/70 hover:bg-lilac">✕</button>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- Field --------------------------------- */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#5A4A93]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12.5px] text-[#7A6BAE]">{hint}</span>}
    </label>
  );
}

export function Backdrop({ height = 640 }: { height?: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 overflow-hidden" style={{ height }}>
      <div className="grid-bg absolute inset-0" />
      <div className="dots-bg absolute inset-0" />
    </div>
  );
}

/** Serif italic accent word used once per headline. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-serif italic font-normal text-lilac">{children}</span>;
}

export function PageHead({ label, title, accent, sub, right }: { label: string; title: ReactNode; accent?: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="label-mono">{label}</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
          {title} {accent && <Accent>{accent}</Accent>}
        </h1>
        {sub && <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-body">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
