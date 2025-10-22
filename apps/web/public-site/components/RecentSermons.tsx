// apps/web/public-site/components/RecentSermons.tsx
import Link from 'next/link';
import React from 'react';
import { Sermon } from '../types';
import { format } from 'date-fns';

interface Props {
  sermons: Sermon[];
}

export default function RecentSermons({ sermons }: Props) {
  if (!sermons || sermons.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold">Recent Sermons</h2>
        <p className="mt-3 text-neutral-600">No recent sermons uploaded.</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recent Sermons</h2>
        <Link href="/sermons" className="text-sm text-indigo-600">View all</Link>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {sermons.map((s) => (
          <article key={s.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-medium">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{s.speaker ?? s.branch ?? 'Unknown'}</p>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{s.series ?? ''}</p>

            <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
              <time dateTime={s.date}>{format(new Date(s.date), 'MMM d, yyyy')}</time>
              <Link href={`/sermons/${s.id}`} className="text-indigo-600">Listen / Watch</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
