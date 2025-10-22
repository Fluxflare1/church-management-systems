// apps/web/public-site/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thogmi.org';

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 }, // ISR caching
  });

  if (!res.ok) {
    console.error(`API Error [${res.status}] - ${url}`);
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json() as Promise<T>;
}
