'use client';
import { useSyncExternalStore } from 'react';
import { RATES, fakeHash, type Currency } from './format';
import { country, type CountryCode, type Product } from './mock-data';
import type { ChainInfo } from './chain';

/* Everything the demo remembers lives in localStorage. No backend. */

export type User = { name: string; email: string; country: CountryCode; currency: Currency; handle: string };
export type ActivityKind = 'sale' | 'bounty' | 'send' | 'cashout' | 'receive';
export type Activity = { id: string; kind: ActivityKind; title: string; sub: string; usd: number; at: number; ref: string; asset: string; chain?: ChainInfo };
export type Sale = {
  id: string; productId: string; title: string; handle: string;
  grossUsd: number; netUsd: number; buyerEmail: string; buyerCountry: CountryCode; method: string;
  payout: Payout; at: number; ref: string;
  /** Live mode only: the Paystack reference this sale was recorded for. */
  paystackRef?: string;
  /** Settlement details: real in testnet mode, flagged `sample` in mock/demo. Absent: receipts derive a sample. */
  chain?: ChainInfo;
  /** Creator Services only: payment held until the buyer confirms delivery. */
  escrow?: Escrow;
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

/**
 * Settle a sale to its store owner (whichever persona owns the store): stablecoin, local payout or
 * Banana balance per their payout choice, plus a plain-language Activity row. No owner here: no-op.
 */
function creditOwner(s: State, sale: Sale): State {
  const other: Role = s.role === 'seller' ? 'buyer' : 'seller';
  const ownerRole: Role | null = s.user.handle === sale.handle ? s.role : s.stash[other]?.user.handle === sale.handle ? other : null;
  if (ownerRole === null) return s; // some other store: the buyer just gets a receipt
  const owner: Slice = ownerRole === s.role ? sliceOf(s) : s.stash[ownerRole]!;
  const payout = sale.payout;
  const assetLabel = payout === 'usdc' ? 'USDC' : payout === 'local' ? owner.user.currency : 'Banana balance';
  const credited: Slice = {
    ...owner,
    walletReady: true,
    walletRevealed: true,
    usdc: payout === 'usdc' ? owner.usdc + sale.netUsd : owner.usdc,
    localUsd: payout === 'local' ? owner.localUsd + sale.netUsd : owner.localUsd,
    banana: payout === 'banana' ? owner.banana + sale.netUsd : owner.banana,
    activity: [
      { id: uid(), kind: 'sale' as const, title: `Sale: ${sale.title}`, sub: `From ${country(sale.buyerCountry).name} · ${sale.method} · paid out as ${assetLabel}`, usd: sale.netUsd, at: Date.now(), ref: sale.ref, asset: assetLabel, chain: sale.chain },
      ...owner.activity,
    ],
  };
  return ownerRole === s.role ? { ...s, ...credited } : { ...s, stash: { ...s.stash, [ownerRole]: credited } };
}

/**
 * A buyer paid in local money → the store owner is settled in stablecoin. Works from either persona. Returns the sale.
 * `escrow: true` (Creator Services): the money is held, and the owner is only credited by releaseEscrow().
 */
export function recordSale(input: { product: Product; grossUsd: number; buyerEmail: string; buyerCountry: CountryCode; method: string; sellerHandle: string; paystackRef?: string; escrow?: boolean }): Sale {
  const fee = 0.02;
  const netUsd = +(input.grossUsd * (1 - fee)).toFixed(2);
  let sale!: Sale;
  update((s) => {
    // Same Paystack payment seen twice (reload on the return URL): hand back the sale, don't credit again.
    const seen = input.paystackRef ? s.sales.find((x) => x.paystackRef === input.paystackRef) : undefined;
    if (seen) { sale = seen; return s; }
    const other: Role = s.role === 'seller' ? 'buyer' : 'seller';
    const owner = s.user.handle === input.sellerHandle ? sliceOf(s) : s.stash[other]?.user.handle === input.sellerHandle ? s.stash[other] : undefined;
    const now = Date.now();
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
      payout: owner?.payout ?? 'usdc',
      at: now,
      ref: fakeHash(),
      paystackRef: input.paystackRef,
      escrow: input.escrow ? { status: 'held', heldAt: now, refundableAt: now + ESCROW_TIMEOUT_MS } : undefined,
    };
    const withSale = { ...s, sales: [sale, ...s.sales] };
    return input.escrow ? withSale : creditOwner(withSale, sale);
  });
  return sale;
}

/* ------------------------------ escrow ----------------------------------- */
/** Creator Services: plain-language states only. "held" → "delivered" → "released" (or "refunded" after the timeout). */
export type EscrowStatus = 'held' | 'delivered' | 'released' | 'refunded';
export type Escrow = {
  status: EscrowStatus;
  heldAt: number;
  refundableAt: number;
  deliveredAt?: number;
  doneAt?: number;
  hold?: ChainInfo;
  release?: ChainInfo;
  refund?: ChainInfo;
};
export const ESCROW_TIMEOUT_MS = 7 * 24 * 3600 * 1000;

function patchSale(s: State, id: string, fn: (x: Sale) => Sale) {
  return { ...s, sales: s.sales.map((x) => (x.id === id ? fn(x) : x)) };
}

/** The hold landed onchain (or in the mock): keep its receipt. */
export function escrowHeld(id: string, tx: ChainInfo) {
  update((s) => patchSale(s, id, (x) => (x.escrow ? { ...x, chain: tx, escrow: { ...x.escrow, hold: tx } } : x)));
}

/** Buyer tapped "Confirm delivery". The release is on its way. */
export function escrowDelivered(id: string) {
  update((s) => patchSale(s, id, (x) => (x.escrow?.status === 'held' ? { ...x, escrow: { ...x.escrow, status: 'delivered', deliveredAt: Date.now() } } : x)));
}

/** Release confirmed: the creator is paid now, exactly once. */
export function escrowReleased(id: string, tx: ChainInfo) {
  update((s) => {
    const sale = s.sales.find((x) => x.id === id);
    if (!sale?.escrow || sale.escrow.status === 'released' || sale.escrow.status === 'refunded') return s;
    const paid: Sale = { ...sale, chain: tx, escrow: { ...sale.escrow, status: 'released', release: tx, doneAt: Date.now() } };
    return creditOwner(patchSale(s, id, () => paid), paid);
  });
}

/** The release didn't go through: back to held so the buyer can try again. */
export function escrowReleaseFailed(id: string) {
  update((s) => patchSale(s, id, (x) => (x.escrow?.status === 'delivered' ? { ...x, escrow: { ...x.escrow, status: 'held', deliveredAt: undefined } } : x)));
}

/** Timed out without delivery: the buyer is refunded to the way they paid. */
export function escrowRefunded(id: string, tx: ChainInfo) {
  update((s) => patchSale(s, id, (x) => (x.escrow?.status === 'held' ? { ...x, chain: tx, escrow: { ...x.escrow, status: 'refunded', refund: tx, doneAt: Date.now() } } : x)));
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
