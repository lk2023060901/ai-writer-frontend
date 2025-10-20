import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import WebVitals from '@/shared/perf/WebVitals';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Writer - Enterprise Platform',
  description: 'Enterprise-grade AI writing platform built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WebVitals />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
