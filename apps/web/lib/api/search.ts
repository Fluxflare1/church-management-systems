import { Branch, Sermon, Event } from '@/types';

export interface SearchResults {
  branches: Branch[];
  sermons: Sermon[];
  events: Event[];
  total: number;
}

export async function globalSearch(query: string, filters?: {
  type?: 'all' | 'branches' | 'sermons' | 'events';
  country?: string;
}): Promise<SearchResults> {
  const params = new URLSearchParams({
    q: query,
    ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
    ...(filters?.country && { country: filters.country })
  });

  const response = await fetch(`/api/v1/search/?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

export async function quickSearch(query: string): Promise<{
  branches: Branch[];
  sermons: Sermon[];
  events: Event[];
}> {
  const response = await fetch(`/api/v1/search/quick/?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error('Quick search failed');
  }

  return response.json();
}
