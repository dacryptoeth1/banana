'use client';
import { useSyncExternalStore } from 'react';
import { RATES, fakeHash, type Currency } from './format';
import { country, type CountryCode, type Product } from './mock-data';

/* Everything the demo remembers lives in localStorage. No backend. */

export type User = { name: string; email: string; country: CountryCode; currency: Currency; handle: string };
export type ActivityKind = 'sale' | 'bounty' | 'send' | 'cashout' | 'receive';
export type Activity = { id: string; kind: ActivityKind; title: string; sub: string; usd: number; at: number; ref: string; asset: string };
export type Sale = {
  id: string; productId: string; title: string; handle: string;
  grossUsd: number; netUsd: number; buyerEmail: string; buyerCountry: CountryCode; method: string;
  payout: Payout; at: number; ref: string;
};
export type Payout = 'usdc' | 'local' | 'banana';
export type BountyStatus = 'started' | 'submitted' | 'paid';

export type Role = 'seller' | 'buyer';

export type State = {
  role: Role;
  /** The other persona's wallet, lessons and profile, parked while you look through the current one. */
  stash: Partial<Record<Role, Slice>>;
  user: User;
  signedUp: boolean;
  walletReady: boolean; // provisioned quietly in the background at sign-up
  walletRevealed: boolean; // the user has met their Digital Wallet
  lessons: Record<string, { done: boolean; score: number }>;
  usdc: number;
  localUsd: number; // paid out in local currency (held in USD terms)
  banana: number; // Banana balance
  activity: Activity[];
  sales: Sale[];
  products: Product[]; // products listed by this user
  payout: Payout;
  bounties: Record<string, BountyStatus>;
};

/** Everything that belongs to one persona. Sales are shared between personas. */
type Slice = Pick<State, 'user' | 'signedUp' | 'walletReady' | 'walletRevealed' | 'lessons' | 'usdc' | 'localUsd' | 'banana' | 'activity' | 'products' | 'payout' | 'bounties'>;

const SELLER_USER: User = { name: 'Rhydar', email: 'rhydar@gmail.com', country: 'NG', currency: 'NGN', handle: 'rhydar' };
const BUYER_USER: User = { name: 'Ama', email: 'ama@studio.gh', country: 'GH', currency: 'GHS', handle: 'ama' };

const freshSlice = (role: Role): Slice => ({
  user: role === 'seller' ? SELLER_USER : BUYER_USER,
  signedUp: false,
  walletReady: false,
  walletRevealed: false,
  lessons: {},
  usdc: 0,
  localUsd: 0,
  banana: 0,
  activity: [],
  products: [],
  payout: 'usdc',
  bounties: {},
});

const sliceOf = (s: State): Slice => ({
  user: s.user, signedUp: s.signedUp, walletReady: s.walletReady, walletRevealed: s.walletRevealed, lessons: s.lessons,
  usdc: s.usdc, localUsd: s.localUsd, banana: s.banana, activity: s.activity, products: s.products, payout: s.payout, bounties: s.bounties,
});

const DEFAULT: State = {
  role: 'seller',
  stash: {},
  user: SELLER_USER,
  signedUp: false,
  walletReady: false,
  walletRevealed: false,
  lessons: {},
  usdc: 0,
  localUsd: 0,
  banana: 0,
  activity: [],
  sales: [],
  products: [],
  payout: 'usdc',
  bounties: {},
};

const KEY = 'banana.demo.v2';
let state: State = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    /* private mode etc. */
  }
}
function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
function update(fn: (s: State) => State) {
  load();
  commit(fn(state));
}
function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useBanana(): State {
  return useSyncExternalStore(subscribe, () => { load(); return state; }, () => DEFAULT);
}

/* ------------------------------ derived ---------------------------------- */
export const balanceUsd = (s: State) => s.usdc + s.localUsd + s.banana;
export const lessonsDone = (s: State) => Object.values(s.lessons).filter((l) => l.done).length;
export const scamLessonDone = (s: State) => !!s.lessons['scams']?.done;
export const SMALL_SEND_LIMIT_USD = 20;

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------ actions ---------------------------------- */
export function signUp(input: { name: string; email: string; country: CountryCode; currency?: Currency }) {
  update((s) => ({
    ...s,
    signedUp: true,
    walletReady: true, // created quietly; revealed later
    user: {
      name: input.name || 'Friend',
      email: input.email,
      country: input.country,
      currency: input.currency ?? country(input.country).currency,
      // The fair demo's creator store is @rhydar, whatever name is typed, so the sale on the path always lands here.
      handle: 'rhydar',
    },
  }));
}

export function setCurrency(currency: Currency) {
  update((s) => ({ ...s, user: { ...s.user, currency } }));
}

export function completeLesson(slug: string, score: number) {
  update((s) => ({ ...s, lessons: { ...s.lessons, [slug]: { done: true, score } } }));
}

export function revealWallet() {
  update((s) => ({ ...s, walletReady: true, walletRevealed: true }));
}

export function setPayout(payout: Payout) {
  update((s) => ({ ...s, payout }));
}

export function addProduct(p: Product) {
  update((s) => ({ ...s, products: [p, ...s.products] }));
}

export function setBounty(id: string, status: BountyStatus) {
  update((s) => ({ ...s, bounties: { ...s.bounties, [id]: status } }));
}

export function payBounty(id: string, title: string, org: string, usdc: number) {
  update((s) => ({
    ...s,
    walletReady: true,
    walletRevealed: true,
    usdc: s.usdc + usdc,
    bounties: { ...s.bounties, [id]: 'paid' },
    activity: [{ id: uid(), kind: 'bounty' as const, title: `Bounty: ${title}`, sub: `Paid by ${org}`, usd: usdc, at: Date.now(), ref: fakeHash(), asset: 'USDC' }, ...s.activity],
  }));
}

/** A buyer paid in local money → the store owner is settled in stablecoin. Works from either persona. Returns the sale. */
export function recordSale(input: { product: Product; grossUsd: number; buyerEmail: string; buyerCountry: CountryCode; method: string; sellerHandle: string }): Sale {
  const fee = 0.02;
  const netUsd = +(input.grossUsd * (1 - fee)).toFixed(2);
  let sale!: Sale;
  update((s) => {
    const other: Role = s.role === 'seller' ? 'buyer' : 'seller';
    const ownerRole: Role | null = s.user.handle === input.sellerHandle ? s.role : s.stash[other]?.user.handle === input.sellerHandle ? other : null;
    const owner: Slice | undefined = ownerRole === null ? undefined : ownerRole === s.role ? sliceOf(s) : s.stash[ownerRole];
    const payout: Payout = owner?.payout ?? 'usdc';
    sale = {
      id: `BNN-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: input.product.id,
      title: input.product.title,
      handle: input.sellerHandle,
      grossUsd: +input.grossUsd.toFixed(2),
      netUsd,
      buyerEmail: input.buyerEmail,
      buyerCountry: input.buyerCountry,
      method: input.method,
      payout,
      at: Date.now(),
      ref: fakeHash(),
    };
    const withSale = { ...s, sales: [sale, ...s.sales] };
    if (!owner || ownerRole === null) return withSale; // some other store: the buyer just gets a receipt

    const assetLabel = payout === 'usdc' ? 'USDC' : payout === 'local' ? owner.user.currency : 'Banana balance';
    const credited: Slice = {
      ...owner,
      walletReady: true,
      walletRevealed: true,
      usdc: payout === 'usdc' ? owner.usdc + netUsd : owner.usdc,
      localUsd: payout === 'local' ? owner.localUsd + netUsd : owner.localUsd,
      banana: payout === 'banana' ? owner.banana + netUsd : owner.banana,
      activity: [
        { id: uid(), kind: 'sale' as const, title: `Sale: ${input.product.title}`, sub: `From ${country(input.buyerCountry).name} · ${input.method} · paid out as ${assetLabel}`, usd: netUsd, at: Date.now(), ref: sale.ref, asset: assetLabel },
        ...owner.activity,
      ],
    };
    return ownerRole === s.role ? { ...withSale, ...credited } : { ...withSale, stash: { ...s.stash, [ownerRole]: credited } };
  });
  return sale;
}

/** Demo switch: look at the same world as the Nigerian seller or the Ghanaian buyer. */
export function switchRole(next: Role) {
  update((s) => {
    if (s.role === next) return s;
    const stash = { ...s.stash, [s.role]: sliceOf(s) };
    return { ...s, ...(stash[next] ?? freshSlice(next)), role: next, stash };
  });
}

export function sendMoney(usd: number, to: string, note: string) {
  update((s) => ({
    ...s,
    usdc: Math.max(0, s.usdc - usd),
    activity: [{ id: uid(), kind: 'send' as const, title: `Sent to ${to}`, sub: note || 'Family support', usd: -usd, at: Date.now(), ref: fakeHash(), asset: 'USDC' }, ...s.activity],
  }));
}

export function cashOut(usd: number, dest: string) {
  update((s) => ({
    ...s,
    usdc: Math.max(0, s.usdc - usd),
    activity: [{ id: uid(), kind: 'cashout' as const, title: `Cash out to ${dest}`, sub: `Paid out in ${s.user.currency}`, usd: -usd, at: Date.now(), ref: fakeHash(), asset: 'USDC' }, ...s.activity],
  }));
}

export function receiveDemo(usd: number, from: string) {
  update((s) => ({
    ...s,
    walletReady: true,
    walletRevealed: true,
    usdc: s.usdc + usd,
    activity: [{ id: uid(), kind: 'receive' as const, title: `Received from ${from}`, sub: 'Family support', usd, at: Date.now(), ref: fakeHash(), asset: 'USDC' }, ...s.activity],
  }));
}

export function resetDemo() {
  loaded = true;
  commit(DEFAULT);
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Convert a USD amount into the user's display currency. */
export const inCurrency = (usd: number, cur: Currency) => usd * RATES[cur];
