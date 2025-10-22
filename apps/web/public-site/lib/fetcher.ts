// apps/web/public-site/lib/fetcher.ts
export const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.thogmi.org';

export async function fetchJSON<T = any>(url: string, options: RequestInit = {}) : Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Fetch error: ${res.status} ${res.statusText} ${text}`);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as T;
}
