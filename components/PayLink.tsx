'use client';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { Avatar, BananaMark, Flag, ProductArt, WhatsAppIcon } from './brand';
import { Button } from './ui';
import { CheckoutSuccess, useCheckout, type Method } from './Checkout';
import { useStoreInfo, useStoreProducts } from './StoreViews';
import { COUNTRIES, country, type CountryCode, type Product } from '@/lib/mock-data';
import { RATES, SYMBOL, cn, money } from '@/lib/format';
import { guessCountry, payPath, priceFor, whatsappUrl } from '@/lib/paylink';
import { useBanana } from '@/lib/state';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** /pay/[creator]/[product]: the whole checkout on one phone screen. */
export function PayLink({ handle, productId }: { handle: string; productId: string }) {
  const p = useStoreProducts(handle).find((x) => x.id === productId);
  const info = useStoreInfo(handle);
  if (!p || !info) {
    return (
      <div className="py-20 text-center">
        <div className="text-[44px]">🍌</div>
        <h1 className="mt-3 text-[30px] font-semibold tracking-tight">This link isn’t active</h1>
        <p className="mt-2 text-body">The product may have been removed, or the link was mistyped.</p>
        <div className="mt-6"><Button href={`/store/${handle}`} variant="light">Visit @{handle}’s store</Button></div>
      </div>
    );
  }
  return <PayLinkCheckout product={p} storeName={info.name} hue={info.hue} />;
}

function PayLinkCheckout({ product: p, storeName, hue }: { product: Product; storeName: string; hue: number }) {
  const me = useBanana();
  const [from, setFrom] = useState<CountryCode>('GH');
  const [typedEmail, setEmail] = useState<string | null>(null);
  const [tapped, setTapped] = useState<Method | null>(null);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState(payPath(p.handle, p.id));
  const { stage, sale, note, error, pay } = useCheckout(p, 'pay');

  useEffect(() => {
    setFrom(guessCountry('GH'));
    setLink(window.location.origin + payPath(p.handle, p.id));
  }, [p.handle, p.id]);

  const email = typedEmail ?? me.user.email; // prefilled in the demo so paying is never a dead end
  const valid = /.+@.+\..+/.test(email);
  const buyer = country(from);
  const local = priceFor(p, from);
  const sameCurrency = local.cur === p.price.currency;
  const rail = buyer.buyerRails[0];

  const go = (method: Method) => { setTapped(method); pay({ email, from, method }); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (stage === 'done' && sale) return <CheckoutSuccess product={p} sale={sale} />;

  return (
    <div>
      <div className="card overflow-hidden !p-0">
        <ProductArt kind={p.art} className="h-44 sm:h-52" />
        <div className="p-5">
          <div className="spring-in flex items-center gap-2.5" style={d(60)}>
            <Avatar name={storeName} hue={hue} size={30} />
            <span className="text-[14px] font-semibold">{storeName}</span>
            <span className="font-mono text-[12px] text-[#8A7BBF]">@{p.handle}</span>
          </div>
          <h1 className="spring-in mt-3 text-[27px] font-semibold leading-[1.08] tracking-[-0.03em]" style={d(120)}>{p.title}</h1>
          <p className="spring-in mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-[#5A4A93]" style={d(160)}>{p.blurb}</p>

          {/* Price in the buyer's own money */}
          <div className="spring-in mt-5 rounded-2xl bg-lilac-2 p-4" style={d(220)}>
            <div className="text-[12.5px] font-semibold text-[#7A6BAE]">You pay</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-[36px] font-bold leading-none tracking-tight tabular-nums">{sameCurrency ? '' : '≈ '}{local.label}</span>
              <span className="text-[13px] font-semibold text-[#7A6BAE]">{local.cur}</span>
            </div>
            <div className="mt-1.5 text-[12.5px] text-[#7A6BAE]">
              {sameCurrency ? 'In your currency.' : <>Creator’s price {money(p.price.amount, p.price.currency)} · $1 ≈ {SYMBOL[local.cur]}{RATES[local.cur].toLocaleString()} (demo rate)</>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Paying from">
              {COUNTRIES.map((c) => (
                <button key={c.code} role="radio" aria-checked={from === c.code} onClick={() => setFrom(c.code)} className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ring-1 ring-inset transition', from === c.code ? 'bg-white text-ink ring-2 ring-violet' : 'text-[#5A4A93] ring-[#DCD2F5] hover:bg-white')}>
                  <Flag code={c.code} className="h-[11px] w-[16px]" />{SYMBOL[c.currency]}
                </button>
              ))}
            </div>
          </div>

          <label className="spring-in mt-4 block" style={d(260)}>
            <span className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#5A4A93]">Email for your receipt</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ama@studio.gh" autoComplete="email" />
          </label>

          <div className="spring-in mt-4 grid gap-2.5" style={d(300)}>
            <Button size="lg" full disabled={!valid || stage === 'paying'} onClick={() => go('MoMo')}>
              {stage === 'paying' && tapped === 'MoMo' ? <><Spinner /> {note}</> : <>Pay with {rail}</>}
            </Button>
            <Button size="lg" variant="soft" full disabled={!valid || stage === 'paying'} onClick={() => go('Card')}>
              {stage === 'paying' && tapped === 'Card' ? <><Spinner dark /> {note}</> : <>Pay with card</>}
            </Button>
          </div>
          {error && <div role="alert" className="mt-3 text-center text-[13.5px] font-medium text-[#B0456A]">{error}</div>}
          {!valid && email.length > 0 && <div className="mt-2 text-center text-[12.5px] text-[#B0456A]">Enter a valid email so we can send your receipt.</div>}
          <p className="mt-3 text-center text-[12.5px] text-[#7A6BAE]">🔒 Unlocks instantly · no account or wallet needed</p>
        </div>
      </div>

      {/* Pass it on */}
      <div className="spring-in mt-5 flex flex-wrap items-center justify-center gap-2" style={d(380)}>
        <a href={whatsappUrl(p, link)} target="_blank" rel="noreferrer" className="btn press bg-[#25D366] px-5 py-2.5 text-[14.5px] text-[#073B1E] shadow-[0_12px_28px_-12px_rgba(37,211,102,.8)]">
          <WhatsAppIcon /> Share to WhatsApp
        </a>
        <button onClick={copy} className="btn bg-white/10 px-4 py-2.5 text-[14px] text-white ring-1 ring-inset ring-white/20 hover:bg-white/15">{copied ? 'Copied ✓' : 'Copy link'}</button>
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-lilac-3">
        <BananaMark size={18} /> Paid through <Link href={`/store/${p.handle}`} className="underline decoration-white/20 underline-offset-2 hover:text-white">Banana</Link>. The creator is settled in stablecoin.
      </p>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return <span className={cn('h-4 w-4 animate-spin rounded-full border-2', dark ? 'border-ink/20 border-t-ink' : 'border-white/40 border-t-white')} />;
}
