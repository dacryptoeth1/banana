Live demo: https://banana-woad-kappa.vercel.app

Demo personas: Avatar → Seller (Nigeria) / Buyer (Ghana) / Reset

# Banana 🍌

**Learn money. Earn money. Move money. Build onchain.**

Banana is an African money app: a money dashboard, short lessons, real earning opportunities, a creator marketplace and a Digital Wallet. Blockchain is infrastructure, not the homepage. The user climbs a ladder, never a leap:

> money education → budgeting → earning → payments → stablecoins → onchain opportunities → marketplace

This repo is a **working frontend with mock data** (Next.js 15 App Router + Tailwind). No backend, no real chain. Everything the demo "remembers" lives in `localStorage`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

Use **Demo → Reset demo** in the avatar menu (top right, inside the app) to start the story over.

## Demo vs live

`NEXT_PUBLIC_BANANA_MODE` picks the mode. It is read at build time, so change it and redeploy.

| | `demo` (default) | `live` |
|---|---|---|
| Sign-up | Prefilled, no real account | Email code (Resend), via next-auth v5 |
| Avatar menu | Demo personas + **Reset demo** | **Sign out** (no personas / reset) |
| `/api/auth/otp/*` | 404 | Active |
| App data | `localStorage` | `localStorage` (no backend yet) |

Live setup: copy `.env.example` to `.env.local` and fill it in.

- `AUTH_SECRET`: `npx auth secret`
- `RESEND_API_KEY` / `EMAIL_FROM`: sender on a domain verified in Resend. Without them, `next dev` prints the code to the server console; production returns an error.

How the email code works: `POST /api/auth/otp/send {email, name}` emails a 6-digit code and sets a signed, httpOnly challenge cookie (10 min); `POST /api/auth/otp/verify {email, code}` checks it and starts the session. There is no database, so the challenge is stateless. The session (JWT) carries `name`, `email` and `country`; the country is added when the user picks it on the signup page. After sign-up, `signUp()` fills the localStorage state as before, so Home / Learn / Wallet are unchanged. Signing out clears that local state.

Known limits: the attempt and send throttles are in memory (per server instance), and app pages are not gated behind a session yet.

## Structure

```
app/
  (marketing)/          landing page + /signup (account → country → quiet setup)
  (app)/
    home/               Money Dashboard
    learn/              track index, and learn/[slug] lesson player
    earn/               opportunity feed + detail sheet
    market/             Market home, and market/sell seller dashboard
    wallet/             Your Digital Wallet
    store/[handle]/     creator store, and store/[handle]/[product] product + checkout
components/             AppShell, Checkout, LessonPlayer, StoreViews, ui, brand
lib/
  mock-data.ts          countries, cash flow, lessons, opportunities, stores, products
  state.ts              localStorage-backed demo state + actions (sales, wallet, lessons…)
  format.ts             currencies (₦ GH₵ KSh R $), demo FX, helpers
```

`next.config.mjs` rewrites `banana.africa/@rhydar` → `/store/rhydar`, so `/@rhydar` and `/@rhydar/logo-design` both work.

## Product decisions worth knowing

- **Digital Wallet, not "onchain wallet".** It's provisioned quietly at sign-up, but only *revealed* when the user finishes "What's USDC?" and taps the bridge CTA, or when money first lands in it (a sale or a bounty). The Wallet tab is never a gate.
- **No first-run crypto language.** "Gas", "seed phrase", "sign transaction" and "approve token" appear only inside the *What does gas mean?* lesson. Receipts say "Receipt"; the transaction hash lives behind "Show technical details".
- **Scam lesson gates Send.** Above about $20 (≈ ₦32,600) the Send sheet stays locked until "How do I protect myself from scams?" is complete.
- **Checkout has no wallet option.** Pay ₦15,000 with Paystack / MoMo / Card, email prefilled. Nothing else. The explorer link lives under Receipt, last.
- **Settlement is stablecoin.** A sale credits the seller's Digital Wallet (net of a 2% Banana fee), or a local-currency / Banana balance depending on the payout choice on the seller dashboard.
- **Currencies.** NGN, GHS, KES, ZAR with a USD display. FX rates are demo constants in `lib/format.ts`. Dashboard data is authored in NGN and converted; rails, bills and bank names vary by country.

## The 3-minute Colosseum demo script

Everything below is click-through only: no typing is required, and there are no dead ends (this exact path is what the test run drives). Start clean with **avatar menu → Demo → Reset demo**.

| # | Beat | What to do | What the judge sees |
|---|------|------------|---------------------|
| 1 | **Landing** (0:00) | Open `/`. Click **Create your Banana account**. | "Sell across Africa *quietly.*" No wallet prompt anywhere. |
| 2 | **Sign up** (0:15) | Name and email are prefilled. **Continue → Nigeria → Continue.** | "Setting things up." Then the Money Dashboard: ₦ cash flow, Opay / GTBank, bills, goals. |
| 3 | **Learn** (0:40) | On Home, click **Resume → What's USDC?** (the featured lesson). Tap through four screens, pass the quick check. | One idea per screen, plain English. |
| 4 | **Wallet appears** (1:10) | On the last screen tap **Create my Digital Wallet →**. | "Your Digital Wallet is ready. You don't need to do anything yet." No seed phrase. |
| 5 | **Market @rhydar** (1:30) | Click **Visit @rhydar's store →**, then **Logo Design**. | Checkout: **Pay ₦15,000**, `≈ $9.20 · paid from Ghana`, **Paystack / MoMo / Card**. Email is prefilled. |
| 6 | **Buy and unlock** (1:50) | Click **Pay ₦15,000**. | "Unlocked. Receipt saved." Download button. **Show receipt** reveals the split, and the explorer link is small and last. |
| 7 | **Settlement** (2:20) | Click **See your settlement →**, then **See in wallet →**. | Seller dashboard: **+$9.02 settled in USDC**. Wallet: ₦14,703 with a plain-language Activity row. |

### Two-person version (optional, 45 seconds)

Use the **Demo** switch in the avatar menu: **Seller (Nigeria, ₦)**, **Buyer (Ghana, GH₵)** and **Reset demo**.

1. Reset demo, then switch to **Buyer**. Open **Market → Logo Design** and pay.
2. On the success card click **See the seller's side →**. It switches to **Seller** and opens the dashboard.
3. The settlement is already there and the seller's wallet holds ₦14,703. The buyer's own wallet was never touched.

Each persona has its own wallet, lessons and profile. Sales are shared between them.

### Bonus beats

- **Send gating:** Wallet → Send ₦90,000 is blocked until the scam lesson is done.
- **Earn:** open the beginner bounty, *Start → Submit → "Demo: fast-forward review"* to receive USDC.
- **Payout toggle:** switch USDC / local currency / Banana balance on the seller dashboard before a purchase.

## Not built (on purpose)

Real auth, real payments (Paystack / MoMo are labels on a mocked success state), a real chain, and translations. The receipt hashes and explorer links are placeholders.
