// apps/web/public-site/app/layout.tsx
import './globals.css';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'THOGMi - The House of God Ministry',
  description: 'THOGMi Digital Platform — connecting branches, members and guests worldwide'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                {/* Placeholder for logo: replace public/logo-round.png */}
                <Image src="/logo-round.png" alt="THOGMi logo" width={40} height={40} />
              </div>
              <span className="font-semibold">THOGMi</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/branches" className="hover:underline">Branches</Link>
              <Link href="/sermons" className="hover:underline">Sermons</Link>
              <Link href="/events" className="hover:underline">Events</Link>
              <Link href="/live" className="hover:underline">Live</Link>
              <Link href="/give" className="hover:underline">Give</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/guest" className="text-sm bg-indigo-600 text-white px-3 py-1 rounded">Connect</Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t bg-white mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-neutral-600">
            <div>© {new Date().getFullYear()} The House of God Ministry (THOGMi)</div>
            <div className="mt-2">Site powered by THOGMi Digital Platform</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
