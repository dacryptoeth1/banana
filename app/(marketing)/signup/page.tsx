'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Backdrop, Button, Field } from '@/components/ui';
import { Flag } from '@/components/brand';
import { COUNTRIES, type CountryCode } from '@/lib/mock-data';
import { SYMBOL, cn } from '@/lib/format';
import { signUp } from '@/lib/state';
import { isLive } from '@/lib/mode';
import { useAuth } from '@/lib/use-auth';

const SETUP = ['Creating your Banana account', 'Setting things up quietly in the background', 'Building your dashboard'];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(isLive ? '' : 'Rhydar');
  const [email, setEmail] = useState(isLive ? '' : 'rhydar@gmail.com');
  const [code, setCode] = useState<CountryCode>('NG');
  const [done, setDone] = useState(0);
  const country = COUNTRIES.find((c) => c.code === code)!;

  // Live only: the 6-digit code screen sits between step 1 and step 2.
  const { data: session, status, update } = useAuth();
  const [awaiting, setAwaiting] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Reloaded after the code step (or a half-finished earlier sign-up): already signed in, only the country is missing.
  useEffect(() => {
    if (status !== 'authenticated' || step !== 1 || awaiting || session?.user?.country) return;
    setName(session?.user?.name ?? '');
    setEmail(session?.user?.email ?? '');
    setStep(2);
  }, [status, session, step, awaiting]);

  async function post(url: string, body: object) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    return r.ok && j?.ok ? { ok: true as const, data: j } : { ok: false as const, error: (j?.error as string) ?? 'Something went wrong. Please try again.' };
  }

  async function sendCode() {
    setBusy(true); setErr('');
    const r = await post('/api/auth/otp/send', { email, name });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setAwaiting(true); setOtp(''); setCooldown(r.data.resendAfter ?? 30);
  }

  async function verifyCode(value: string) {
    if (busy) return;
    setBusy(true); setErr('');
    const r = await post('/api/auth/otp/verify', { email, code: value });
    if (!r.ok) { setBusy(false); setOtp(''); return setErr(r.error); }
    await update(); // pick up the new session cookie
    setBusy(false);
    setName(name.trim() || r.data.user?.name || '');
    setAwaiting(false);
    setStep(2);
  }

  async function chooseCountry() {
    if (isLive) {
      setBusy(true);
      await update({ country: code }); // saved on the session so it survives a refresh
      setBusy(false);
    }
    setStep(3);
  }

  useEffect(() => {
    if (step !== 3) return;
    // Live: the verified email from the session wins over whatever is in the field.
    const finalEmail = (isLive && session?.user?.email) || email;
    signUp({ name: name.trim() || session?.user?.name || finalEmail.split('@')[0] || 'Friend', email: finalEmail || 'you@banana.africa', country: code });
    const timers = SETUP.map((_, i) => setTimeout(() => setDone(i + 1), 700 * (i + 1)));
    const go = setTimeout(() => router.push('/home'), 700 * SETUP.length + 500);
    return () => { timers.forEach(clearTimeout); clearTimeout(go); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="relative">
      <Backdrop height={620} />
      <div className="relative mx-auto max-w-[520px] px-4 pb-16 pt-14 sm:pt-20">
        <div className="label-mono text-center">[ 0{step} / 03 ] &nbsp;·&nbsp; {awaiting ? 'CHECK YOUR EMAIL' : step === 1 ? 'YOUR ACCOUNT' : step === 2 ? 'YOUR COUNTRY' : 'ALMOST THERE'}</div>
        <h1 className="mt-4 text-center text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
          {awaiting && <>Enter your <span className="font-serif italic font-normal text-lilac">code.</span></>}
          {step === 1 && !awaiting && <>Create your Banana <span className="font-serif italic font-normal text-lilac">account</span></>}
          {step === 2 && <>Where do you <span className="font-serif italic font-normal text-lilac">live?</span></>}
          {step === 3 && <>Setting things <span className="font-serif italic font-normal text-lilac">up.</span></>}
        </h1>

        <div className="well mt-10">
          <div className="card !p-6">
            {step === 1 && awaiting && (
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
            )}
            {step === 1 && !awaiting && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (isLive) sendCode(); else setStep(2); }}>
                <Field label="Your name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rhydar" autoComplete="name" /></Field>
                <Field label={isLive ? 'Email' : 'Email or phone'}><input className="input" type={isLive ? 'email' : 'text'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isLive ? 'you@email.com' : 'you@email.com or +234…'} autoComplete="email" required /></Field>
                {err && <p role="alert" className="text-[13.5px] font-medium text-[#B0456A]">{err}</p>}
                <Button type="submit" size="lg" full disabled={busy}>{busy ? 'Sending code…' : 'Continue'}</Button>
                {!isLive && <>
                <div className="flex items-center gap-3 text-[12.5px] text-[#9C8FCB]"><span className="h-px flex-1 bg-[#E8DFFA]" />or<span className="h-px flex-1 bg-[#E8DFFA]" /></div>
                <button type="button" onClick={() => { setName(name || 'Rhydar'); setEmail(email || 'rhydar@gmail.com'); setStep(2); }} className="btn w-full bg-lilac-2 py-3.5 text-[15.5px] text-ink hover:bg-lilac">
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
                  Continue with Google
                </button>
                </>}
                <p className="text-center text-[12.5px] text-[#9C8FCB]">No wallet needed. No crypto knowledge needed.</p>
                {isLive && <p className="text-center text-[13.5px] text-[#5A4A93]">Already have an account? <Link href="/signin" className="font-semibold text-violet hover:underline">Sign in</Link></p>}
              </form>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {COUNTRIES.map((c) => (
                    <button key={c.code} onClick={() => setCode(c.code)} className={cn('flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 ring-inset transition', code === c.code ? 'bg-lilac-2 ring-2 ring-violet' : 'ring-[#E5DCFA] hover:bg-lilac-2')}>
                      <Flag code={c.code} className="h-[18px] w-[27px]" />
                      <div>
                        <div className="text-[15px] font-semibold">{c.name}</div>
                        <div className="text-[12.5px] text-[#7A6BAE]">{SYMBOL[c.currency]} {c.currency}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="rounded-xl bg-lilac-2 px-4 py-3 text-[14px] text-[#5A4A93]">We’ll show your money in <b>{country.currency}</b>, and connect {country.rails.slice(0, 3).join(', ')}. You can change this any time.</p>
                <Button size="lg" full disabled={busy} onClick={chooseCountry}>Continue</Button>
              </div>
            )}
            {step === 3 && (
              <ul className="space-y-3 py-2">
                {SETUP.map((t, i) => (
                  <li key={t} className="flex items-center gap-3 text-[16px]">
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold transition', done > i ? 'bg-gold text-ink' : 'bg-lilac-2 text-[#9C8FCB]')}>{done > i ? '✓' : ''}</span>
                    <span className={done > i ? 'text-ink' : 'text-[#9C8FCB]'}>{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
