const PRICE_CACHE_KEY = 'crypto_price_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟

interface PriceCacheItem {
  timestamp: number;
  data: any;
}

interface PriceCache {
  [key: string]: PriceCacheItem;
}

export function getCachedPrice(symbol: string, startTime: number, endTime: number): any | null {
  const cacheKey = `${symbol}_${startTime}_${endTime}`;
  const cached = localStorage.getItem(PRICE_CACHE_KEY);
  
  if (!cached) return null;
  
  try {
    const cache: PriceCache = JSON.parse(cached);
    const item = cache[cacheKey];
    
    if (!item || Date.now() - item.timestamp > CACHE_DURATION) {
      delete cache[cacheKey];
      localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return item.data;
  } catch {
    return null;
  }
}

export function setCachedPrice(symbol: string, startTime: number, endTime: number, data: any): void {
  const cacheKey = `${symbol}_${startTime}_${endTime}`;
  const cached = localStorage.getItem(PRICE_CACHE_KEY);
  const cache: PriceCache = cached ? JSON.parse(cached) : {};
  
  cache[cacheKey] = {
    timestamp: Date.now(),
    data
  };
  
  localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
}