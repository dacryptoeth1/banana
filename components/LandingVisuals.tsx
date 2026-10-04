import Link from 'next/link';
import { stagger } from '@/lib/motion';

/** Barely-there moving light behind the marketing pages. Transform-only, no blur filters. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="ambient-blob ambient-a" />
      <span className="ambient-blob ambient-b" />
      <span className="ambient-blob ambient-c hidden md:block" />
    </div>
  );
}

/* --------------------------------- Categories ------------------------------ */
const CATS: { name: string; sub: string; icon: string }[] = [
  { name: 'Designs', sub: 'Logos, brand kits', icon: 'M12 3a9 9 0 100 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.4-1-2.4s.8-1.5 1.8-1.5H17a4 4 0 004-4c0-4.7-4-8.5-9-8.5zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01' },
  { name: 'Templates', sub: 'Notion, Figma, code', icon: 'M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z' },
  { name: 'Courses', sub: 'Playbooks and guides', icon: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13' },
  { name: 'Services', sub: 'Hire a creator', icon: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0M14 14.5a6 6 0 018 5.5' },
  { name: 'Tickets', sub: 'Events and passes', icon: 'M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4zM14 6v12' },
  { name: 'Gaming items', sub: 'Skins and codes', icon: 'M6 9h4M8 7v4M15 8h.01M18 10h.01M7 4h10a5 5 0 015 5v3a5 5 0 01-9 3h-2a5 5 0 01-9-3V9a5 5 0 015-5z' },
];

export function CategoryTiles({ from = 0 }: { from?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {CATS.map((c, i) => (
        <div key={c.name} className="reveal-item" style={stagger(from + i)}>
          <Link href="/market" className="cat-tile group flex h-full flex-col rounded-[20px] border border-white/15 bg-white/[0.06] p-4">
            <span className="cat-icon flex h-10 w-10 items-center justify-center rounded-xl bg-lilac-2 text-violet">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={c.icon} />
              </svg>
            </span>
            <span className="mt-4 text-[16px] font-semibold tracking-tight">{c.name}</span>
            <span className="mt-0.5 flex items-center justify-between gap-2 text-[13px] text-body">
              {c.sub}
              <span className="cat-arrow text-lilac" aria-hidden>→</span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
