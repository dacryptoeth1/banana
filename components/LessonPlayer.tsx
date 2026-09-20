'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Progress } from './ui';
import { LESSONS, lesson } from '@/lib/mock-data';
import { completeLesson, revealWallet, useBanana } from '@/lib/state';
import { cn } from '@/lib/format';

export function LessonPlayer({ slug }: { slug: string }) {
  const l = lesson(slug)!;
  const router = useRouter();
  const s = useBanana();
  const [i, setI] = useState(0); // 0..screens-1 = screens; screens.length = quiz; +1 = done
  const [pick, setPick] = useState<number | null>(null);
  const total = l.screens.length;
  const stage: 'screen' | 'quiz' | 'done' = i < total ? 'screen' : i === total ? 'quiz' : 'done';
  const progress = ((Math.min(i, total + 1)) / (total + 1)) * 100;
  const idx = LESSONS.findIndex((x) => x.slug === slug);
  const next = LESSONS[idx + 1];
  const correct = pick === l.quiz.answer;
  const isUsdc = slug === 'usdc';
  const isScams = slug === 'scams';

  function submitQuiz() {
    if (pick === null) return;
    if (correct) {
      completeLesson(slug, 1);
      setI(total + 1);
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/learn" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg ring-1 ring-inset ring-white/15 hover:bg-white/15" aria-label="Back to Learn">←</Link>
        <div className="flex-1"><Progress className="!bg-white/15" tone="gold" value={progress} /></div>
        <span className="font-mono text-[12px] tracking-widest text-lilac-3">{Math.min(i + 1, total + 1)}/{total + 1}</span>
      </div>

      <div className="label-mono">{l.title} · {l.minutes} min</div>

      <div className="well mt-4">
        {stage === 'screen' && (
          <div key={i} className="card rise !p-8 sm:!p-10">
            <div className="text-[56px] leading-none">{l.screens[i].emoji}</div>
            <h1 className="mt-6 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[38px]">{l.screens[i].title}</h1>
            <p className="mt-4 text-[18.5px] leading-relaxed text-[#4C3E82]">{l.screens[i].body}</p>
            <div className="mt-8 flex items-center justify-between">
              <button disabled={i === 0} onClick={() => setI(i - 1)} className="text-[15px] font-medium text-[#7A6BAE] disabled:opacity-30">← Back</button>
              <Button onClick={() => setI(i + 1)}>{i === total - 1 ? 'Quick check' : 'Next'} →</Button>
            </div>
          </div>
        )}

        {stage === 'quiz' && (
          <div className="card rise !p-8 sm:!p-10">
            <div className="label-mono !text-[#8A7BBF]">Quick check</div>
            <h1 className="mt-4 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[32px]">{l.quiz.q}</h1>
            <div className="mt-6 space-y-3">
              {l.quiz.options.map((o, k) => {
                const chosen = pick === k;
                const state = chosen ? (k === l.quiz.answer ? 'ok' : 'bad') : 'idle';
                return (
                  <button key={o} onClick={() => setPick(k)} className={cn('flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-[16.5px] ring-1 ring-inset transition', state === 'idle' && 'ring-[#E5DCFA] hover:bg-lilac-2', state === 'ok' && 'bg-gold/20 ring-2 ring-gold', state === 'bad' && 'bg-rose-soft/20 ring-2 ring-rose-soft')}>
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold', chosen ? 'bg-violet text-white' : 'bg-lilac-2 text-violet')}>{String.fromCharCode(65 + k)}</span>
                    {o}
                  </button>
                );
              })}
            </div>
            {pick !== null && !correct && <p className="mt-4 rounded-xl bg-rose-soft/20 px-4 py-3 text-[14.5px] text-[#8A3550]">Not quite — have another look. Hint: {l.quiz.why}</p>}
            <div className="mt-7 flex items-center justify-between">
              <button onClick={() => { setI(total - 1); setPick(null); }} className="text-[15px] font-medium text-[#7A6BAE]">← Review</button>
              <Button disabled={pick === null} onClick={submitQuiz}>Check answer</Button>
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="card rise !p-8 text-center sm:!p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[30px]">✓</div>
            <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.03em] sm:text-[38px]">Lesson complete.</h1>
            <p className="mt-2 text-[16.5px] text-[#4C3E82]">{l.quiz.why}</p>

            {isUsdc && !s.walletRevealed && (
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-violet to-canvas p-6 text-left text-white">
                <div className="label-mono !text-lilac">Next step</div>
                <p className="mt-2 text-[21px] font-semibold leading-snug tracking-tight">You just learned what USDC is. Want to create your first Digital Wallet?</p>
                <p className="mt-2 text-[14.5px] text-lilac">It takes a second. No words to memorise, nothing to install.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button variant="light" onClick={() => { revealWallet(); router.push('/wallet'); }}>Create my Digital Wallet →</Button>
                  <Button variant="ghost" href="/learn">Not now</Button>
                </div>
              </div>
            )}
            {isUsdc && s.walletRevealed && (
              <div className="mt-8"><Button href="/wallet">Open your Digital Wallet →</Button></div>
            )}
            {isScams && <p className="mt-6 rounded-xl bg-gold/20 px-4 py-3 text-[14.5px] text-[#6B4E00]">🔓 Higher send limits are now unlocked in your Digital Wallet.</p>}

            {!(isUsdc && !s.walletRevealed) && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {next ? <Button href={`/learn/${next.slug}`}>Next: {next.title} →</Button> : <Button href="/wallet">Go to your wallet →</Button>}
                <Button variant="soft" href="/learn">All lessons</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
