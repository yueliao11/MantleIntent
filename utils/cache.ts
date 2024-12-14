type CacheData = {
  data: any;
  timestamp: number;
};

const DEFI_CACHE_KEY = 'defi_protocols';
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟

export async function getDefiProtocolsWithCache() {
  const cached = localStorage.getItem(DEFI_CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch('https://api.llama.fi/protocols');
  const data = await response.json();
  
  localStorage.setItem(DEFI_CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
  
  return data;
}