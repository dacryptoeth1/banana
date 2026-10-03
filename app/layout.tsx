import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { siteOrigin } from '@/lib/paylink';

// Self-hosted at build time: no render-blocking request to Google on first paint.
const sans = Inter_Tight({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()), // absolute Open Graph image URLs, so WhatsApp and X can fetch them
  title: 'Banana — Learn money. Earn money. Move money.',
  description: 'An African money app. The chain stays in the basement.',
};
export const viewport: Viewport = { themeColor: '#3D1F8C' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="font-sans"><Providers>{children}</Providers></body>
    </html>
  );
}
