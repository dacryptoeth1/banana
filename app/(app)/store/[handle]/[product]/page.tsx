import { ProductView } from '@/components/StoreViews';

export default async function ProductPage({ params }: { params: Promise<{ handle: string; product: string }> }) {
  const { handle, product } = await params;
  return <ProductView handle={decodeURIComponent(handle).replace(/^@/, '')} productId={product} />;
}
