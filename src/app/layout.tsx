import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { AuthListener } from '@/components/auth-listener';

export const metadata: Metadata = {
  title: 'Bullsara',
  description: 'Bullsara Luxury Car Lottery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <AuthListener />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
