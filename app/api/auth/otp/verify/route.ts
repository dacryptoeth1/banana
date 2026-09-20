import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signIn } from '@/auth';
import { OTP_COOKIE, normalizeEmail, verifyChallenge } from '@/lib/otp';
import { isLive } from '@/lib/mode';

export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });
const MESSAGES = {
  expired: 'That code has expired. Ask for a new one.',
  invalid: "That code isn't right. Check it and try again.",
  locked: 'Too many tries. Ask for a new code.',
} as const;

/** POST { email, code } → checks the code, then starts the session cookie. */
export async function POST(req: Request) {
  if (!isLive) return fail('Not found', 404);
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';

  const jar = await cookies();
  const challenge = jar.get(OTP_COOKIE)?.value;
  const r = verifyChallenge(challenge, email, code);
  if (!r.ok) return fail(MESSAGES[r.reason], r.reason === 'locked' ? 429 : 400);

  try {
    await signIn('otp', { email, code, challenge, redirect: false });
  } catch (err) {
    console.error('[otp/verify]', err);
    return fail("We couldn't sign you in. Please try again.", 500);
  }
  jar.delete({ name: OTP_COOKIE, path: '/api/auth' });
  return NextResponse.json({ ok: true, user: { email: r.email, name: r.name } });
}
