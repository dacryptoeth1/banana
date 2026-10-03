'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WhatsAppIcon } from './brand';
import type { Product } from '@/lib/mock-data';
import { cn } from '@/lib/format';
import { payPath, whatsappUrl } from '@/lib/paylink';

/** A creator's shareable checkout link for one product: copy it, send it on WhatsApp, or open it. */
export function PayLinkShare({ product, compact, className }: { product: Product; compact?: boolean; className?: string }) {
  const path = payPath(product.handle, product.id);
  const [link, setLink] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => setLink(window.location.origin + path), [path]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const pill = 'btn press px-3.5 py-2 text-[13px]';

  return (
    <div className={cn(compact ? '' : 'rounded-[22px] bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]', className)}>
      {!compact && (
        <>
          <div className="text-[15px] font-semibold">Pay link</div>
          <p className="mt-0.5 text-[13.5px] text-body">One link, straight to checkout. Buyers see the price in their own currency.</p>
        </>
      )}
      <div className={cn('truncate rounded-xl bg-black/20 px-3 py-2 font-mono text-[12.5px] text-lilac', compact ? 'mt-1' : 'mt-3')}>{link.replace(/^https?:\/\//, '')}</div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a href={whatsappUrl(product, link)} target="_blank" rel="noreferrer" className={cn(pill, 'bg-[#25D366] text-[#073B1E]')}><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
        <button onClick={copy} className={cn(pill, 'bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15')}>{copied ? 'Copied ✓' : 'Copy link'}</button>
        <Link href={path} className={cn(pill, 'bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15')}>Open ↗</Link>
      </div>
    </div>
  );
}
