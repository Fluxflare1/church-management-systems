// apps/web/public-site/components/LiveNow.tsx
'use client';
import useSWR from 'swr';
import Link from 'next/link';
import React from 'react';
import type { LiveStream } from '../types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LiveNow() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thogmi.org';
  const { data, error } = useSWR<LiveStream[]>(`${apiBase}/api/v1/streams/live/`, fetcher, { refreshInterval: 10000 });

  if (error) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold">Live Now</h2>
        <p className="mt-2 text-sm text-red-600">Unable to load live streams.</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold">Live Now</h2>
        <p className="mt-2 text-sm text-neutral-500">Loading live streams…</p>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold">Live Now</h2>
        <p className="mt-2 text-sm text-neutral-600">No services are live right now.</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Now</h2>
        <Link href="/live" className="text-sm text-indigo-600">More streams</Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4 flex items-start gap-4 shadow-sm">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{s.title}</h3>
              <p className="text-sm text-neutral-500 mt-1">{s.branch.name} • {s.platform.toUpperCase()}</p>
              <div className="mt-3 flex items-center gap-3">
                <a href={s.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1 rounded bg-red-600 text-white text-sm">Watch</a>
                {s.chatEnabled ? <span className="text-sm text-neutral-500">Chat on</span> : <span className="text-sm text-neutral-400">Chat off</span>}
              </div>
            </div>

            <div className="text-sm text-neutral-500">
              <div>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="mt-2 text-xs">{s.viewers ?? 0} viewers</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
