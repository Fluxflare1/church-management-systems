// apps/web/public-site/components/FeaturedEvents.tsx
import Link from 'next/link';
import { ChurchEvent } from '../types';
import React from 'react';
import { format } from 'date-fns';

interface Props {
  events: ChurchEvent[];
}

export default function FeaturedEvents({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold">Featured Events</h2>
        <p className="mt-3 text-neutral-600">No featured events at the moment. Check back soon.</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured Events</h2>
        <Link href="/events" className="text-sm text-indigo-600">View all events</Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <article key={ev.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{ev.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{ev.eventType.toUpperCase()} • {ev.scope.toUpperCase()}</p>
              </div>
              <div className="text-sm text-neutral-600">
                <time dateTime={ev.startDate}>{format(new Date(ev.startDate), 'MMM d, yyyy')}</time>
              </div>
            </div>

            <p className="mt-3 text-neutral-600 text-sm line-clamp-3">{ev.description}</p>

            <div className="mt-4 flex items-center justify-between">
              {ev.liveStream?.available ? (
                <a href={ev.liveStream.url} target="_blank" rel="noreferrer" className="text-sm bg-red-600 text-white px-3 py-1 rounded">Watch Live</a>
              ) : (
                <span className="text-sm text-neutral-500">No live stream</span>
              )}
              <Link href={`/events/${ev.id}`} className="text-sm text-indigo-600">Details</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
