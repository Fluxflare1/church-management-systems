// apps/web/public-site/app/page.tsx
import React from 'react';
import Hero from '../components/Hero';
import FeaturedEvents from '../components/FeaturedEvents';
import LiveNow from '../components/LiveNow';
import RecentSermons from '../components/RecentSermons';
import BranchSpotlight from '../components/BranchSpotlight';
import ErrorBoundary from '../components/ErrorBoundary';

import { fetchJSON } from '../lib/fetcher';
import { CACHE_MEDIUM, CACHE_LONG } from '../lib/cache';
import type { HeroContent, ChurchEvent, Sermon, Branch } from '../types';

async function fetchHero(): Promise<HeroContent | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thogmi.org'}/api/v1/pages/home/hero/`;
    return await fetchJSON<HeroContent>(url, CACHE_MEDIUM as any);
  } catch (err) {
    console.warn('Failed to fetch hero:', err);
    return null;
  }
}

async function fetchFeaturedEvents(): Promise<ChurchEvent[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thogmi.org'}/api/v1/events/?scope=global&featured=true`;
    return await fetchJSON<ChurchEvent[]>(url, CACHE_MEDIUM as any);
  } catch (err) {
    console.warn('Failed to fetch featured events', err);
    return [];
  }
}

async function fetchRecentSermons(): Promise<Sermon[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thogmi.org'}/api/v1/sermons/?limit=6&ordering=-date`;
    return await fetchJSON<Sermon[]>(url, CACHE_LONG as any);
  } catch (err) {
    console.warn('Failed to fetch recent sermons', err);
    return [];
  }
}

async function fetchSpotlightBranch(): Promise<Branch | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thogmi.org'}/api/v1/branches/spotlight/`;
    return await fetchJSON<Branch>(url, CACHE_LONG as any);
  } catch (err) {
    console.warn('Failed to fetch branch spotlight', err);
    return null;
  }
}

export default async function HomePage() {
  const [hero, events, sermons, branch] = await Promise.all([
    fetchHero(),
    fetchFeaturedEvents(),
    fetchRecentSermons(),
    fetchSpotlightBranch()
  ]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <ErrorBoundary>
        <Hero hero={hero} />
      </ErrorBoundary>

      <ErrorBoundary>
        <LiveNow />
      </ErrorBoundary>

      <ErrorBoundary>
        <FeaturedEvents events={events} />
      </ErrorBoundary>

      <ErrorBoundary>
        <RecentSermons sermons={sermons} />
      </ErrorBoundary>

      <ErrorBoundary>
        <BranchSpotlight branch={branch} />
      </ErrorBoundary>
    </main>
  );
}
