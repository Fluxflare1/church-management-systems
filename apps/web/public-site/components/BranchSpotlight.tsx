// apps/web/public-site/components/BranchSpotlight.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Branch } from '../types';

interface Props {
  branch?: Branch | null;
}

export default function BranchSpotlight({ branch }: Props) {
  if (!branch) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold">Branch Spotlight</h2>
      <div className="mt-6 flex flex-col md:flex-row items-center gap-6 bg-white border rounded-lg p-6 shadow-sm">
        <div className="relative w-full md:w-1/3 h-48 rounded overflow-hidden">
          {branch.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image src={branch.image} alt={branch.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">{branch.name}</div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold">{branch.name}</h3>
          <p className="mt-2 text-neutral-600">{branch.address}</p>

          <div className="mt-4 flex gap-3 items-center">
            <Link href={`/branches/${branch.slug}`} className="inline-flex items-center px-4 py-2 rounded bg-indigo-600 text-white text-sm">View Page</Link>
            <a href={`https://maps.google.com?q=${encodeURIComponent(branch.address ?? branch.name)}`} target="_blank" rel="noreferrer" className="text-sm text-neutral-600">Open in maps</a>
          </div>
        </div>
      </div>
    </section>
  );
}
