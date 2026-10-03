import type { Metadata } from 'next';
import { PayLink } from '@/components/PayLink';
import { PRODUCTS, store } from '@/lib/mock-data';
import { money } from '@/lib/format';

type Params = { params: Promise<{ creator: string; product: string }> };

const clean = (h: string) => decodeURIComponent(h).replace(/^@/, '');

// Catalogue products are prerendered; anything a creator listed in this browser renders on demand.
export const generateStaticParams = () => PRODUCTS.map((p) => ({ creator: p.handle, product: p.id }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { creator, product } = await params;
  const handle = clean(creator);
  const p = PRODUCTS.find((x) => x.handle === handle && x.id === product);
  const seller = store(handle)?.name ?? `@${handle}`;
  const title = p ? `${p.title} · ${money(p.price.amount, p.price.currency)} · ${seller}` : `Pay ${seller} on Banana`;
  const description = p ? `${p.blurb} Pay with mobile money or card, in your own currency.` : 'Pay with mobile money or card, in your own currency.';
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Banana' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PayPage({ params }: Params) {
  const { creator, product } = await params;
  return <PayLink handle={clean(creator)} productId={product} />;
}
