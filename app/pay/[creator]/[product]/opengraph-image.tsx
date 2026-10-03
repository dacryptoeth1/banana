import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { BananaMark } from '@/components/brand';
import { PRODUCTS, store } from '@/lib/mock-data';
import { convert, money } from '@/lib/format';

export const alt = 'Pay with mobile money or card on Banana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Same gradients as <ProductArt>, so the preview matches the product page.
const ART: Record<string, string> = {
  logo: 'linear-gradient(135deg,#F6F0FF,#DCCBFF)',
  chart: 'linear-gradient(135deg,#2B1470,#6A38D6)',
  kit: 'linear-gradient(135deg,#FFE9A8,#FFC93C)',
  people: 'linear-gradient(135deg,#EDE6FF,#B99BFF)',
  ticket: 'linear-gradient(135deg,#FFD9E6,#F5A3C4)',
  course: 'linear-gradient(135deg,#E3F5EE,#9ADCC0)',
  game: 'linear-gradient(135deg,#1E1145,#5B2FB5)',
};

// Inter Tight, bundled: the default OG font has no ₦ or ₵. latin-ext carries the currency signs.
const font = (f: string) => readFile(join(process.cwd(), 'assets/fonts', `inter-tight-${f}-normal.woff`));
async function fonts() {
  const [l4, l7, e4, e7] = await Promise.all(['latin-400', 'latin-700', 'latin-ext-400', 'latin-ext-700'].map(font));
  return [
    { name: 'Inter Tight', data: l4, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter Tight', data: l7, weight: 700 as const, style: 'normal' as const },
    // Separate family name: same-name fonts are deduplicated, which would drop the ₦/₵ glyphs.
    { name: 'Inter Tight Ext', data: e4, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter Tight Ext', data: e7, weight: 700 as const, style: 'normal' as const },
  ];
}

export default async function OgImage({ params }: { params: Promise<{ creator: string; product: string }> }) {
  const { creator, product } = await params;
  const handle = decodeURIComponent(creator).replace(/^@/, '');
  const p = PRODUCTS.find((x) => x.handle === handle && x.id === product);
  const seller = store(handle)?.name ?? `@${handle}`;
  const elsewhere = p
    ? (['NGN', 'GHS', 'KES', 'ZAR'] as const).filter((c) => c !== p.price.currency).slice(0, 3).map((c) => money(convert(p.price.amount, p.price.currency, c), c, { decimals: 0 })).join('  ·  ')
    : '';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', padding: 64, fontFamily: '"Inter Tight", "Inter Tight Ext"', color: '#fff', background: 'linear-gradient(160deg,#2B1470 0%,#3D1F8C 55%,#5B2FB5 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', paddingRight: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 34, fontWeight: 700 }}>
            <BananaMark size={52} /> Banana
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, color: '#D9C8FF' }}>{`${seller} · @${handle}`}</div>
            <div style={{ marginTop: 10, fontSize: p && p.title.length > 24 ? 60 : 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>{p?.title ?? 'Pay on Banana'}</div>
            {p && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 30 }}>
                <div style={{ display: 'flex', background: '#FFC93C', color: '#1E1145', borderRadius: 999, padding: '12px 30px', fontSize: 44, fontWeight: 700 }}>{money(p.price.amount, p.price.currency)}</div>
                <div style={{ fontSize: 24, color: '#C6B8EA' }}>{elsewhere}</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 28, color: '#F3EDFF' }}>Pay with mobile money or card, in your own currency.</div>
        </div>
        <div style={{ display: 'flex', width: 380, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: 360, height: 360, borderRadius: 48, background: ART[p?.art ?? 'kit'] ?? ART.kit, alignItems: 'center', justifyContent: 'center' }}>
            <BananaMark size={200} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
