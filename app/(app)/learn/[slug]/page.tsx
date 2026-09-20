import { notFound } from 'next/navigation';
import { LESSONS, lesson } from '@/lib/mock-data';
import { LessonPlayer } from '@/components/LessonPlayer';

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = lesson(slug);
  if (!l) notFound();
  return <LessonPlayer slug={slug} />;
}
