import { convert, money } from './format';
import { COUNTRIES, type CountryCode, type Product } from './mock-data';

/* Pay-by-link: one shareable checkout URL per product, /pay/[creator]/[product]. */

export const payPath = (handle: string, productId: string) => `/pay/${handle}/${productId}`;

/** The canonical site origin for links and Open Graph images. Previews point at themselves. */
export function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Prefilled WhatsApp share. wa.me with no number lets the sender pick the chat. */
export function whatsappUrl(p: Product, link: string) {
  const text = `Hi! You can get *${p.title}* from @${p.handle} on Banana 🍌\nPay ${money(p.price.amount, p.price.currency)} with mobile money or card, in your own currency:\n${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** The price a buyer in `cc` sees, in their own currency. */
export function priceFor(p: Product, cc: CountryCode) {
  const cur = COUNTRIES.find((c) => c.code === cc)!.currency;
  const amount = convert(p.price.amount, p.price.currency, cur);
  return { cur, amount, label: money(amount, cur, { decimals: amount < 1000 ? 2 : 0 }) };
}

const TZ: Record<string, CountryCode> = { 'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Nairobi': 'KE', 'Africa/Johannesburg': 'ZA' };

/** Where the buyer is paying from: ?from=GH on the link, else their time zone, else their language region. Never asks. */
export function guessCountry(fallback: CountryCode = 'GH'): CountryCode {
  try {
    const q = new URLSearchParams(window.location.search).get('from')?.toUpperCase();
    if (q && COUNTRIES.some((c) => c.code === q)) return q as CountryCode;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ[tz]) return TZ[tz];
    for (const l of navigator.languages ?? []) {
      const region = l.split('-')[1]?.toUpperCase();
      if (region && COUNTRIES.some((c) => c.code === region)) return region as CountryCode;
    }
  } catch { /* old browser: fall through */ }
  return fallback;
}
