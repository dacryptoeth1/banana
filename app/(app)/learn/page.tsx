'use client';
import Link from 'next/link';
import { PageHead, Progress, SectionLabel } from '@/components/ui';
import { LESSONS, TRACKS, lesson } from '@/lib/mock-data';
import { lessonsDone, scamLessonDone, useBanana } from '@/lib/state';
import { cn } from '@/lib/format';

export default function LearnIndex() {
  const s = useBanana();
  const done = lessonsDone(s);
  const nextSlug = !s.lessons['usdc']?.done ? 'usdc' : LESSONS.find((l) => !s.lessons[l.slug]?.done)?.slug;

  return (
    <div>
      <PageHead
        label="[ 02 / 05 ] · LEARN MONEY"
        title="Short lessons."
        accent="One idea each."
        sub="Plain English. Three minutes. A wallet only appears when you understand why you’d want one."
        right={
          <div className="card !py-3 !px-5">
            <div className="text-[12.5px] text-[#7A6BAE]">Your progress</div>
            <div className="text-[22px] font-bold">{done} / {LESSONS.length} lessons</div>
            <Progress className="mt-2 w-40" value={(done / LESSONS.length) * 100} tone="gold" />
          </div>
        }
      />

      {!scamLessonDone(s) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-4 text-[15px]">
          <span><b>Heads up:</b> finish “How do I protect myself from scams?” to unlock larger sends from your Digital Wallet.</span>
          <Link href="/learn/scams" className="font-semibold text-gold underline underline-offset-4">Take the scam lesson →</Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {TRACKS.map((t, i) => {
          const ls = t.lessons.map((slug) => lesson(slug)!);
          const d = ls.filter((l) => s.lessons[l.slug]?.done).length;
          return (
            <div key={t.id} className="well">
              <div className="rounded-[20px] bg-gradient-to-br from-violet to-canvas p-5 text-white shadow-card">
                <div className="flex items-center justify-between">
                  <SectionLabel n={i + 1} total={3} label={t.level.toUpperCase()} />
                  <span className="text-[12.5px] text-lilac">{d}/{ls.length}</span>
                </div>
                <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">{t.title}</h3>
                <p className="mt-1.5 text-[14.5px] text-lilac">{t.blurb}</p>
                <Progress className="mt-4 !bg-white/20" tone="gold" value={(d / ls.length) * 100} />
              </div>
              <div className="mt-3 space-y-2.5">
                {ls.map((l) => {
                  const st = s.lessons[l.slug];
                  return (
                    <Link key={l.slug} href={`/learn/${l.slug}`} className={cn('flex items-center gap-3 rounded-[18px] p-4 shadow-card transition hover:-translate-y-0.5', st?.done ? 'bg-lilac-2' : 'bg-white', l.slug === nextSlug && 'ring-2 ring-gold')}>
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold', st?.done ? 'bg-gold text-ink' : 'bg-lilac-2 text-violet')}>{st?.done ? '✓' : '▶'}</span>
                      <span className="min-w-0 flex-1 text-ink">
                        <span className="block text-[16px] font-semibold leading-snug tracking-tight">{l.title}</span>
                        <span className="block text-[13px] text-[#7A6BAE]">{l.minutes} min · {l.blurb}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
