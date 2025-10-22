// apps/web/public-site/components/Hero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { HeroContent } from '../types';
import React from 'react';

interface Props {
  hero?: HeroContent | null;
}

export default function Hero({ hero }: Props) {
  if (!hero) {
    return (
      <header className="w-full bg-gradient-to-r from-sky-50 to-white px-6 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-semibold">Welcome to THOGMi</h1>
          <p className="mt-3 text-neutral-600">A global ministry connecting people to God and each other.</p>
        </div>
      </header>
    );
  }

  const cta = hero.cta;
  return (
    <header className="w-full bg-white">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 py-16">
        <div>
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded">
            {hero.priority?.toUpperCase()}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">{hero.title}</h1>
          <p className="mt-4 text-neutral-600">{hero.description}</p>

          <div className="mt-6 flex gap-3">
            {cta && (
              <Link href={cta.link} className={`inline-flex items-center px-5 py-3 rounded-md text-sm font-medium ${cta.variant === 'primary' ? 'bg-indigo-600 text-white' : 'border border-neutral-200 text-neutral-900'}`}>
                {cta.text}
              </Link>
            )}
            {hero.liveStream?.isLive && hero.liveStream.streamUrl && (
              <a href={hero.liveStream.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-3 rounded-md text-sm font-medium bg-red-600 text-white">
                Watch Live — {hero.liveStream.branch}
              </a>
            )}
          </div>
        </div>

        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow">
          {hero.image ? (
            <Image src={hero.image} alt={hero.title} fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">No image</div>
          )}
        </div>
      </div>
    </header>
  );
}
