import 'server-only';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/*
 * Stateless email codes. There is no database, so the challenge lives in a signed httpOnly cookie:
 *   cookie = base64url({ e: email, n: name, x: expiresAt, i: issuedAt }) + '.' + HMAC(AUTH_SECRET, payload + '.' + code)
 * The code itself is only ever in the email. Guessing it means asking our server (the HMAC key never leaves it).
 */

export const OTP_COOKIE = 'banana_otp';
export const OTP_TTL_S = 10 * 60;
export const OTP_RESEND_S = 30;
const MAX_ATTEMPTS = 5;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizeEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');

type Payload = { e: string; n: string; x: number; i: number };
export type Challenge = { email: string; name: string; issuedAt: number };

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET is not set');
  return s;
};
const mac = (payload: string, code: string) => createHmac('sha256', secret()).update(`${payload}.${code}`).digest('base64url');

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function issueChallenge(email: string, name: string, code: string): string {
  const now = Date.now();
  const p: Payload = { e: email, n: name, x: now + OTP_TTL_S * 1000, i: now };
  const payload = Buffer.from(JSON.stringify(p)).toString('base64url');
  return `${payload}.${mac(payload, code)}`;
}

function parse(cookie: string | undefined): { payload: string; sig: string; p: Payload } | null {
  if (!cookie) return null;
  const [payload, sig] = cookie.split('.');
  if (!payload || !sig) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Payload;
    if (typeof p.e !== 'string' || typeof p.n !== 'string' || typeof p.x !== 'number' || typeof p.i !== 'number') return null;
    return { payload, sig, p };
  } catch {
    return null;
  }
}

/** Who a challenge cookie was issued to, without checking a code. Used to throttle re-sends. */
export function peekChallenge(cookie: string | undefined): Challenge | null {
  const c = parse(cookie);
  return c && c.p.x > Date.now() ? { email: c.p.e, name: c.p.n, issuedAt: c.p.i } : null;
}

/* Best-effort brute-force guard. In-memory, so it is per server instance; the HMAC is what actually protects the code. */
const attempts = new Map<string, number>();

export type VerifyResult = { ok: true; email: string; name: string } | { ok: false; reason: 'expired' | 'invalid' | 'locked' };

export function verifyChallenge(cookie: string | undefined, email: string, code: string): VerifyResult {
  const c = parse(cookie);
  if (!c || c.p.e !== email) return { ok: false, reason: 'expired' };
  if (c.p.x <= Date.now()) return { ok: false, reason: 'expired' };
  const key = c.sig;
  if ((attempts.get(key) ?? 0) >= MAX_ATTEMPTS) return { ok: false, reason: 'locked' };
  const want = Buffer.from(mac(c.payload, code));
  const got = Buffer.from(c.sig);
  if (!/^\d{6}$/.test(code) || want.length !== got.length || !timingSafeEqual(want, got)) {
    attempts.set(key, (attempts.get(key) ?? 0) + 1);
    if (attempts.size > 5000) attempts.clear();
    return { ok: false, reason: 'invalid' };
  }
  attempts.delete(key);
  return { ok: true, email: c.p.e, name: c.p.n };
}

/* Throttle sends (best-effort, per instance): one per 30s and 5/hour for an email; a looser 30/hour per IP so shared networks aren't blocked. */
const sends = new Map<string, number[]>();
const HOUR = 60 * 60 * 1000;
export function sendAllowed(email: string, ip: string): boolean {
  const now = Date.now();
  const recent = (k: string) => (sends.get(k) ?? []).filter((t) => now - t < HOUR);
  const byEmail = recent(`e:${email}`);
  const byIp = recent(`ip:${ip}`);
  if (byEmail.length >= 5 || byIp.length >= 30) return false;
  if (byEmail.length && now - byEmail[byEmail.length - 1] < OTP_RESEND_S * 1000) return false;
  sends.set(`e:${email}`, [...byEmail, now]);
  sends.set(`ip:${ip}`, [...byIp, now]);
  if (sends.size > 5000) sends.clear();
  return true;
}

export async function sendCodeEmail(to: string, name: string, code: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[banana otp] RESEND_API_KEY/EMAIL_FROM not set, so no email was sent. Code for ${to}: ${code}\n`);
      return;
    }
    throw new Error('RESEND_API_KEY and EMAIL_FROM must be set');
  }
  const hi = name ? `Hi ${name.replace(/[<>&"]/g, '')},` : 'Hi,';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      subject: `${code} is your Banana code`,
      text: `${hi}\n\nYour Banana code is ${code}. It expires in ${OTP_TTL_S / 60} minutes.\n\nIf you didn't ask for this, you can ignore this email.`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#1a0850"><p>${hi}</p><p>Your Banana code is</p><p style="font-size:34px;font-weight:700;letter-spacing:.3em;margin:8px 0">${code}</p><p style="color:#7A6BAE">It expires in ${OTP_TTL_S / 60} minutes. If you didn't ask for this, you can ignore this email.</p></div>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
