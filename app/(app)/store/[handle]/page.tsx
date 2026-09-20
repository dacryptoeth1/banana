import { StoreView } from '@/components/StoreViews';

export default async function StorePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <StoreView handle={decodeURIComponent(handle).replace(/^@/, '')} />;
}
