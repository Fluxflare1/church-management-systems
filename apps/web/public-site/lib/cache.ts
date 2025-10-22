// apps/web/public-site/lib/cache.ts
export const CACHE_SHORT = { next: { revalidate: 60 } };
export const CACHE_MEDIUM = { next: { revalidate: 300 } };
export const CACHE_LONG = { next: { revalidate: 3600 } };
export const NO_CACHE = { cache: 'no-store' };
