import Link from 'next/link';
import type { CountryCode } from '@/lib/mock-data';

export function BananaMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M30 8c-1-3 2-5 5-4 1 3 0 6-1 9z" fill="#8A6A12" />
      <path d="M22 16c6-4 14-3 18 3 4 6 3 15-2 22-6 8-16 12-26 11-3 0-3-3-1-4 9-4 13-9 15-16 1-5-1-9-5-11-2-1-2-4 1-5z" fill="#FFD54A" />
      <path d="M33 17c5 4 6 11 4 18-2 6-6 11-12 15 7 0 14-4 18-10 5-7 5-16 0-22-3-4-7-4-10-1z" fill="#F2B21E" />
      <path d="M24 17c-3 1-4 3-3 5 6 2 9 8 7 15-2 6-6 10-11 13 3 0 7-1 10-4" fill="none" stroke="#FFF1B8" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      <path d="M40 20c6-2 12 2 14 9-4-3-9-3-13-1z" fill="#FFC93C" />
      <path d="M39 30c5-3 11-2 15 3-5-1-9 0-13 3z" fill="#F2B21E" />
    </svg>
  );
}

export function Logo({ href = '/', size = 34 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-[22px] font-bold tracking-tight">
      <BananaMark size={size} />
      Banana
    </Link>
  );
}

export function Flag({ code, className = 'h-[15px] w-[22px]' }: { code: CountryCode; className?: string }) {
  const base = `${className} rounded-[3px] ring-1 ring-white/40 overflow-hidden shrink-0`;
  if (code === 'NG')
    return (
      <svg viewBox="0 0 3 2" className={base} aria-label="Nigeria">
        <rect width="3" height="2" fill="#fff" />
        <rect width="1" height="2" fill="#008751" />
        <rect x="2" width="1" height="2" fill="#008751" />
      </svg>
    );
  if (code === 'GH')
    return (
      <svg viewBox="0 0 3 2" className={base} aria-label="Ghana">
        <rect width="3" height="2" fill="#006B3F" />
        <rect width="3" height=".667" fill="#CE1126" />
        <rect y=".667" width="3" height=".667" fill="#FCD116" />
        <polygon points="1.5,.72 1.6,1.02 1.92,1.02 1.66,1.2 1.76,1.5 1.5,1.32 1.24,1.5 1.34,1.2 1.08,1.02 1.4,1.02" fill="#111" />
      </svg>
    );
  if (code === 'KE')
    return (
      <svg viewBox="0 0 3 2" className={base} aria-label="Kenya">
        <rect width="3" height="2" fill="#fff" />
        <rect width="3" height=".55" fill="#111" />
        <rect y=".725" width="3" height=".55" fill="#BB0000" />
        <rect y="1.45" width="3" height=".55" fill="#006600" />
        <ellipse cx="1.5" cy="1" rx=".28" ry=".5" fill="#BB0000" stroke="#fff" strokeWidth=".04" />
      </svg>
    );
  return (
    <svg viewBox="0 0 3 2" className={base} aria-label="South Africa">
      <rect width="3" height="1" fill="#DE3831" />
      <rect y="1" width="3" height="1" fill="#002395" />
      <path d="M0 0L1.3 1L0 2Z" fill="#000" stroke="#FFB612" strokeWidth=".12" />
      <path d="M0 0L1.3 1L3 1M0 2L1.3 1" fill="none" stroke="#fff" strokeWidth=".55" />
      <path d="M0 0L1.3 1L3 1M0 2L1.3 1" fill="none" stroke="#007A4D" strokeWidth=".3" />
    </svg>
  );
}

/** Small product illustrations — thumbnails for the Market. */
export function ProductArt({ kind, className = '' }: { kind: string; className?: string }) {
  const bg: Record<string, string> = {
    logo: 'linear-gradient(135deg,#F6F0FF,#DCCBFF)',
    chart: 'linear-gradient(135deg,#2B1470,#6A38D6)',
    kit: 'linear-gradient(135deg,#FFE9A8,#FFC93C)',
    people: 'linear-gradient(135deg,#EDE6FF,#B99BFF)',
    ticket: 'linear-gradient(135deg,#FFD9E6,#F5A3C4)',
    course: 'linear-gradient(135deg,#E3F5EE,#9ADCC0)',
    game: 'linear-gradient(135deg,#1E1145,#5B2FB5)',
  };
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg[kind] ?? bg.logo }}>
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {kind === 'logo' && (<><circle cx="80" cy="60" r="34" fill="#5B2FB5" /><circle cx="108" cy="60" r="34" fill="#7C3AFF" opacity=".85" /><circle cx="128" cy="60" r="20" fill="#FFC93C" /><rect x="150" y="30" width="34" height="8" rx="4" fill="#3D1F8C" opacity=".7" /></>)}
        {kind === 'chart' && (<><polyline points="20,95 65,72 100,80 145,42 185,22" fill="none" stroke="#FFC93C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><rect x="24" y="24" width="60" height="7" rx="3.5" fill="#D9C8FF" opacity=".8" /><rect x="24" y="38" width="38" height="7" rx="3.5" fill="#D9C8FF" opacity=".5" /><circle cx="185" cy="22" r="7" fill="#fff" /></>)}
        {kind === 'kit' && (<><rect x="28" y="20" width="60" height="80" rx="10" fill="#fff" opacity=".9" /><rect x="98" y="20" width="76" height="36" rx="10" fill="#5B2FB5" /><rect x="98" y="64" width="76" height="36" rx="10" fill="#fff" opacity=".7" /><circle cx="58" cy="50" r="11" fill="#7C3AFF" /></>)}
        {kind === 'people' && (<><circle cx="72" cy="46" r="15" fill="#5B2FB5" /><circle cx="122" cy="52" r="13" fill="#FFC93C" /><path d="M36 106c3-24 20-32 36-32s30 8 34 32z" fill="#7C3AFF" /><path d="M104 106c1-18 12-24 22-24s20 6 24 24z" fill="#3D1F8C" /></>)}
        {kind === 'ticket' && (<><rect x="30" y="26" width="140" height="68" rx="12" fill="#fff" opacity=".92" /><circle cx="30" cy="60" r="9" fill="#F5A3C4" /><circle cx="170" cy="60" r="9" fill="#F5A3C4" /><rect x="112" y="38" width="42" height="42" rx="4" fill="#3D1F8C" opacity=".85" /><rect x="46" y="42" width="52" height="8" rx="4" fill="#3D1F8C" opacity=".7" /><rect x="46" y="58" width="34" height="8" rx="4" fill="#3D1F8C" opacity=".35" /></>)}
        {kind === 'course' && (<><rect x="34" y="22" width="132" height="76" rx="10" fill="#fff" opacity=".9" /><rect x="48" y="38" width="70" height="8" rx="4" fill="#3D1F8C" opacity=".7" /><rect x="48" y="54" width="104" height="6" rx="3" fill="#3D1F8C" opacity=".3" /><rect x="48" y="66" width="86" height="6" rx="3" fill="#3D1F8C" opacity=".3" /><circle cx="146" cy="40" r="10" fill="#FFC93C" /></>)}
        {kind === 'game' && (<><rect x="36" y="34" width="128" height="56" rx="28" fill="#D9C8FF" /><rect x="60" y="54" width="26" height="8" rx="4" fill="#3D1F8C" /><rect x="69" y="45" width="8" height="26" rx="4" fill="#3D1F8C" /><circle cx="128" cy="52" r="6" fill="#FFC93C" /><circle cx="144" cy="64" r="6" fill="#7C3AFF" /></>)}
      </svg>
    </div>
  );
}

export function Avatar({ name, hue = 268, size = 44 }: { name: string; hue?: number; size?: number }) {
  const initials = name.replace(/[’']s Store/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white/70"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg,hsl(${hue} 80% 62%),hsl(${(hue + 40) % 360} 70% 32%))` }}
    >
      {initials}
    </span>
  );
}
