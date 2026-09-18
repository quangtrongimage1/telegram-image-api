import { getCache } from '@vercel/functions';

const cache = getCache({
   namespace: 'telegram-image-api',
});

export interface CacheOptions {
   ttl?: number;
   tags?: string[];
   name?: string;
}

/**
 * Get a value from Vercel Runtime Cache.
 */
export async function getCacheValue<T>(key: string): Promise<T | undefined> {
   return cache.get(key) as Promise<T | undefined>;
}

/**
 * Set a value in Vercel Runtime Cache.
 */
export async function setCacheValue<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
   await cache.set(key, value, options);
}

/**
 * Delete a value from Vercel Runtime Cache.
 */
export async function deleteCacheValue(key: string): Promise<void> {
   await cache.delete(key);
}

/**
 * Expire all cache entries associated with a tag.
 */
export async function expireCacheTag(tag: string): Promise<void> {
   await cache.expireTag(tag);
}
