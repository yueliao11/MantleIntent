const LLAMA_BASE_URL = 'https://api.llama.fi';
const LLAMA_YIELDS_URL = 'https://yields.llama.fi';

export async function fetchPoolData() {
  try {
    const response = await fetch('https://yields.llama.fi/pools');
    if (!response.ok) throw new Error('Failed to fetch pool data');
    const data = await response.json();
    
    return data.data.map((pool: any) => ({
      name: pool.project,
      apy: parseFloat(pool.apy) || 0,
      tvl: parseFloat(pool.tvlUsd) || 0,
      pool: pool.pool,
      symbol: pool.symbol,
      chain: pool.chain,
      url: pool.url || `https://defillama.com/protocol/${pool.project.toLowerCase()}`,
      projectUrl: pool.projectUrl,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      rewardTokens: pool.rewardTokens
    }));
  } catch (error) {
    console.error('Failed to fetch DeFi pools:', error);
    throw error;
  }
}

export async function fetchProtocolTVL(slug: string) {
  try {
    const response = await fetch(`${LLAMA_BASE_URL}/tvl/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch TVL data');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch protocol TVL:', error);
    throw error;
  }
}