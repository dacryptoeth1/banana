import { NextResponse } from 'next/server';
import { EMAIL_RE, OTP_COOKIE, OTP_RESEND_S, OTP_TTL_S, issueChallenge, newCode, normalizeEmail, peekChallenge, sendAllowed, sendCodeEmail } from '@/lib/otp';
import { isLive } from '@/lib/mode';

export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/** POST { email, name } → emails a 6-digit code and sets the signed challenge cookie. */
export async function POST(req: Request) {
  if (!isLive) return fail('Not found', 404);
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return fail('Enter a valid email address.', 400);

  const cookie = req.headers.get('cookie')?.match(new RegExp(`(?:^|; )${OTP_COOKIE}=([^;]+)`))?.[1];
  const prev = peekChallenge(cookie);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const tooSoon = prev?.email === email && Date.now() - prev.issuedAt < OTP_RESEND_S * 1000;
  if (tooSoon || !sendAllowed(email, ip)) return fail('Please wait a moment before asking for another code.', 429);

  const code = newCode();
  try {
    await sendCodeEmail(email, name, code);
  } catch (err) {
    console.error('[otp/send]', err);
    return fail("We couldn't send that email. Please try again.", 502);
  }

  const res = NextResponse.json({ ok: true, resendAfter: OTP_RESEND_S });
  res.cookies.set(OTP_COOKIE, issueChallenge(email, name, code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
    maxAge: OTP_TTL_S,
  });
  return res;
}
