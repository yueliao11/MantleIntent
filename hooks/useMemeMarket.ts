import { useQuery } from '@tanstack/react-query';
import { MANTLE_MEME_TOKENS } from '@/lib/constants/memeTokens';
import * as ethers from 'ethers';

const CRYPTOCOMPARE_API_KEY = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;

const fetchTokenData = async (token: any, retries: number) => {
  try {
    // 首先尝试从CryptoCompare获取数据
    const cryptoCompareUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${token.symbol}&tsyms=USD&api_key=${CRYPTOCOMPARE_API_KEY}`;
    const response = await fetch(cryptoCompareUrl);
    const data = await response.json();
    
    let priceData;
    
    if (data.RAW && data.RAW[token.symbol] && data.RAW[token.symbol].USD) {
      const rawData = data.RAW[token.symbol].USD;
      priceData = {
        price: rawData.PRICE,
        change24h: rawData.CHANGEPCT24HOUR,
        volume24h: rawData.VOLUME24HOUR,
        marketCap: rawData.MKTCAP
      };
    } else {
      // 如果CryptoCompare没有数据，回退到Agni
      const agniResponse = await fetch(
        `https://api.agni.finance/v1/tokens/${token.address}`
      );
      priceData = await agniResponse.json();
    }

    // 获取AI分析
    const aiAnalysis = await fetch('/api/meme-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: token.symbol,
        price: priceData.price,
        change24h: priceData.change24h,
        volume24h: priceData.volume24h,
        marketCap: priceData.marketCap
      })
    }).then(r => {
      if (!r.ok) {
        throw new Error('AI分析请求失败');
      }
      return r.json();
    }).catch(error => {
      console.error('AI分析错误:', error);
      return { sentiment: '暂时无法获取AI分析' };
    });

    return {
      ...token,
      price: priceData.price || 0,
      change24h: priceData.change24h || 0,
      volume24h: priceData.volume24h || 0,
      marketCap: priceData.marketCap || 0,
      aiSentiment: aiAnalysis.sentiment || "AI分析请求失败,请稍后重试"
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${token.symbol}:`, error);
    
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchTokenData(token, retries - 1);
    }

    return {
      ...token,
      price: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
      aiSentiment: "数据获取失败,请检查网络连接"
    };
  }
};

export function useMemeMarket(enableCache = true) {
  const { data: memeTokens = [], isLoading, error } = useQuery({
    queryKey: ['mantleMemeTokens'],
    queryFn: async () => {
      const provider = new ethers.JsonRpcProvider('https://rpc.mantle.xyz');
      
      const tokenData = await Promise.all(
        MANTLE_MEME_TOKENS.map(async (token) => {
          return fetchTokenData(token, 3);
        })
      );

      return tokenData;
    },
    enabled: true,
    staleTime: enableCache ? 60 * 1000 : 0 // 1分钟缓存
  });

  return { memeTokens, isLoading, error };
} 