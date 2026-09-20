'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Backdrop, Button, Field } from '@/components/ui';
import { Flag } from '@/components/brand';
import { COUNTRIES, type CountryCode } from '@/lib/mock-data';
import { SYMBOL, cn } from '@/lib/format';
import { signUp } from '@/lib/state';

const SETUP = ['Creating your Banana account', 'Setting things up quietly in the background', 'Building your dashboard'];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Rhydar');
  const [email, setEmail] = useState('rhydar@gmail.com');
  const [code, setCode] = useState<CountryCode>('NG');
  const [done, setDone] = useState(0);
  const country = COUNTRIES.find((c) => c.code === code)!;

  useEffect(() => {
    if (step !== 3) return;
    signUp({ name: name.trim() || email.split('@')[0] || 'Friend', email: email || 'you@banana.africa', country: code });
    const timers = SETUP.map((_, i) => setTimeout(() => setDone(i + 1), 700 * (i + 1)));
    const go = setTimeout(() => router.push('/home'), 700 * SETUP.length + 500);
    return () => { timers.forEach(clearTimeout); clearTimeout(go); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="relative">
      <Backdrop height={620} />
      <div className="relative mx-auto max-w-[520px] px-4 pb-16 pt-14 sm:pt-20">
        <div className="label-mono text-center">[ 0{step} / 03 ] &nbsp;·&nbsp; {step === 1 ? 'YOUR ACCOUNT' : step === 2 ? 'YOUR COUNTRY' : 'ALMOST THERE'}</div>
        <h1 className="mt-4 text-center text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
          {step === 1 && <>Create your Banana <span className="font-serif italic font-normal text-lilac">account</span></>}
          {step === 2 && <>Where do you <span className="font-serif italic font-normal text-lilac">live?</span></>}
          {step === 3 && <>Setting things <span className="font-serif italic font-normal text-lilac">up.</span></>}
        </h1>

        <div className="well mt-10">
          <div className="card !p-6">
            {step === 1 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <Field label="Your name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rhydar" autoComplete="name" /></Field>
                <Field label="Email or phone"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com or +234…" autoComplete="email" required /></Field>
                <Button type="submit" size="lg" full>Continue</Button>
                <div className="flex items-center gap-3 text-[12.5px] text-[#9C8FCB]"><span className="h-px flex-1 bg-[#E8DFFA]" />or<span className="h-px flex-1 bg-[#E8DFFA]" /></div>
                <button type="button" onClick={() => { setName(name || 'Rhydar'); setEmail(email || 'rhydar@gmail.com'); setStep(2); }} className="btn w-full bg-lilac-2 py-3.5 text-[15.5px] text-ink hover:bg-lilac">
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
                  Continue with Google
                </button>
                <p className="text-center text-[12.5px] text-[#9C8FCB]">No wallet needed. No crypto knowledge needed.</p>
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
                <Button size="lg" full onClick={() => setStep(3)}>Continue</Button>
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
