import { useEffect, useState } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useI18n } from '@/lib/i18n/I18nContext';
import { AssetAllocation } from '@/components/AssetAllocation';
import { getCachedData, setCachedData } from '@/utils/cache';
import { DeFiRecommendations } from '@/components/DeFiRecommendations';
import { EnhancedDeFiRecommendations } from './EnhancedDeFiRecommendations';

interface TokenBalance {
  symbol: string;
  balance: string;
  price: number;
  value: number;
  thumbnail?: string;
  name?: string;
  priceHistory?: {
    time: string;
    value: number;
  }[];
}

export function PortfolioPerformance() {
  const [historicalPrices, setHistoricalPrices] = useState<{
    timestamp: number;
    totalValue: number;
  }[]>([]);
  const { address } = useWallet();
  const { t } = useI18n();
  const [assets, setAssets] = useState<TokenBalance[]>([]);

  // 接收来自 AssetAllocation 的资产更新
  const handleAssetsUpdate = (newAssets: TokenBalance[]) => {
    setAssets(newAssets);
  };

  useEffect(() => {
    const fetchHistoricalPrices = async () => {
      if (!address || !assets.length) return;
      
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - 30 * 24 * 60 * 60; // 30天
      
      try {
        const pricePromises = assets.map(async (token) => {
          const prices = await fetchPriceWithCache(
            token.symbol,
            startTime,
            endTime
          );
          
          return {
            symbol: token.symbol,
            balance: parseFloat(token.balance),
            prices: prices.map((p: any) => ({
              timestamp: p.timestamp,
              price: p.price
            }))
          };
        });
        
        const tokenPrices = await Promise.all(pricePromises);
        
        // 计算每日总价值
        const timePoints = new Set<number>();
        tokenPrices.forEach(token => {
          token.prices.forEach(p => timePoints.add(p.timestamp));
        });
        
        const sortedTimePoints = Array.from(timePoints).sort();
        const portfolioValues = sortedTimePoints.map(timestamp => {
          const totalValue = tokenPrices.reduce((sum, token) => {
            const price = token.prices.find(p => p.timestamp === timestamp)?.price || 0;
            return sum + (token.balance * price);
          }, 0);
          
          return {
            timestamp,
            totalValue
          };
        });
        
        setHistoricalPrices(portfolioValues);
      } catch (error) {
        console.error('Failed to fetch historical prices:', error);
      }
    };

    fetchHistoricalPrices();
  }, [address, assets]);

  return (
    <div className="space-y-4">
      <EnhancedDeFiRecommendations />
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t('wallet.overview.performance')}
          </h2>
          <div className="h-[300px]">
            <LineChart data={historicalPrices} />
          </div>
        </div>
      </Card>
      
      <AssetAllocation onAssetsUpdate={handleAssetsUpdate} />
    </div>
  );
} 