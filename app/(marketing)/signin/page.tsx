'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Backdrop, Button, Field } from '@/components/ui';
import { signUp } from '@/lib/state';
import { isLive } from '@/lib/mode';
import { useAuth } from '@/lib/use-auth';

/** Email → 6-digit code → session. Same endpoints as /signup; no password. */
export default function Signin() {
  const router = useRouter();
  const { data: session, status, update } = useAuth();
  const [email, setEmail] = useState('');
  const [awaiting, setAwaiting] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Demo mode has no accounts, so there is nothing to sign in to.
  useEffect(() => {
    if (!isLive) router.replace('/signup');
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Signed in (just now, or already): fill this browser's state from the session and go in.
  // No country on the session means sign-up was never finished, so send them to finish it.
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    const { name, email: mail, country } = session.user;
    if (!country) return router.replace('/signup');
    signUp({ name: name || mail?.split('@')[0] || 'Friend', email: mail ?? '', country });
    router.replace('/home');
  }, [status, session, router]);

  async function post(url: string, body: object) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    return r.ok && j?.ok ? { ok: true as const, data: j } : { ok: false as const, error: (j?.error as string) ?? 'Something went wrong. Please try again.' };
  }

  async function sendCode() {
    setBusy(true); setErr('');
    const r = await post('/api/auth/otp/send', { email });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setAwaiting(true); setOtp(''); setCooldown(r.data.resendAfter ?? 30);
  }

  async function verifyCode(value: string) {
    if (busy) return;
    setBusy(true); setErr('');
    const r = await post('/api/auth/otp/verify', { email, code: value });
    if (!r.ok) { setBusy(false); setOtp(''); return setErr(r.error); }
    await update(); // picks up the new session; the effect above takes it from there
    setBusy(false);
  }

  return (
    <div className="relative">
      <Backdrop height={560} />
      <div className="relative mx-auto max-w-[520px] px-4 pb-16 pt-14 sm:pt-20">
        <div className="label-mono text-center">{awaiting ? 'CHECK YOUR EMAIL' : 'WELCOME BACK'}</div>
        <h1 className="mt-4 text-center text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
          {awaiting ? <>Enter your <span className="font-serif italic font-normal text-lilac">code.</span></> : <>Sign in to <span className="font-serif italic font-normal text-lilac">Banana</span></>}
        </h1>

        <div className="well mt-10">
          <div className="card !p-6">
            {awaiting ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (otp.length === 6) verifyCode(otp); }}>
                <p className="text-[14.5px] text-[#5A4A93]">We sent a 6-digit code to <b className="break-all">{email}</b>. It expires in 10 minutes.</p>
                <Field label="6-digit code">
                  <input
                    className="input text-center font-mono text-[26px] tracking-[.5em]"
                    value={otp}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setOtp(v); if (v.length === 6) verifyCode(v); }}
                    inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="······" autoFocus
                  />
                </Field>
                {err && <p role="alert" className="text-[13.5px] font-medium text-[#B0456A]">{err}</p>}
                <Button type="submit" size="lg" full disabled={busy || otp.length !== 6}>{busy ? 'Checking…' : 'Verify'}</Button>
                <div className="flex items-center justify-between text-[13.5px] text-[#5A4A93]">
                  <button type="button" onClick={() => { setAwaiting(false); setErr(''); setOtp(''); }} className="font-semibold hover:underline">Use a different email</button>
                  <button type="button" onClick={sendCode} disabled={busy || cooldown > 0} className="font-semibold hover:underline disabled:opacity-50 disabled:no-underline">{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
                <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" required autoFocus /></Field>
                {err && <p role="alert" className="text-[13.5px] font-medium text-[#B0456A]">{err}</p>}
                <Button type="submit" size="lg" full disabled={busy}>{busy ? 'Sending code…' : 'Email me a code'}</Button>
                <p className="text-center text-[12.5px] text-[#9C8FCB]">No password. We’ll email you a 6-digit code.</p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[14.5px] text-[#D8CCF5]">New here? <Link href="/signup" className="font-semibold text-white underline underline-offset-2">Create account</Link></p>
      </div>
    </div>
  );
}
