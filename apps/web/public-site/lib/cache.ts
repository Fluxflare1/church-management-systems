// apps/web/public-site/lib/cache.ts
// Lightweight wrapper for fetch cache options for server components
export const CACHE_SHORT = { next: { revalidate: 60 } }; // 60s
export const CACHE_MEDIUM = { next: { revalidate: 300 } }; // 5m
export const CACHE_LONG = { next: { revalidate: 3600 } }; // 1h
export const NO_CACHE = { cache: 'no-store' };
