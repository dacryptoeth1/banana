export type Currency = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';

// Demo FX: units of currency per 1 USD.
export const RATES: Record<Currency, number> = { NGN: 1630, GHS: 15.5, KES: 129, ZAR: 18.2, USD: 1 };
export const SYMBOL: Record<Currency, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };

export const convert = (amount: number, from: Currency, to: Currency) => (amount / RATES[from]) * RATES[to];

type MoneyOpts = { decimals?: number; sign?: boolean; compact?: boolean };

export function money(amount: number, cur: Currency, o: MoneyOpts = {}) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : o.sign && amount > 0 ? '+' : '';
  let body: string;
  if (o.compact && abs >= 1_000_000) body = `${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  else if (o.compact && abs >= 10_000) body = `${Math.round(abs / 1000)}k`;
  else {
    const decimals = o.decimals ?? (cur === 'USD' ? (Number.isInteger(abs) ? 0 : 2) : cur === 'GHS' || cur === 'ZAR' || cur === 'KES' ? (abs < 100 ? 2 : 0) : 0);
    body = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return `${sign}${SYMBOL[cur]}${body}`;
}

export function ago(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function fakeHash() {
  let h = '';
  for (let i = 0; i < 64; i++) h += Math.floor(Math.random() * 16).toString(16);
  return `0x${h}`;
}

export const shortHash = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;

export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
