"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, Loader2, Download } from "lucide-react";
import { useWallet } from "@/lib/WalletContext";
import { useEffect, useState } from "react";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import * as ethers from "ethers";
import { AssetPriceChart } from "./AssetPriceChart";
import { cn } from "@/lib/utils";
import { useI18n } from '@/lib/i18n/I18nContext';
import { DeFiRecommendations } from "./DeFiRecommendations";
import { getCachedPrice, setCachedPrice } from "@/utils/priceCache";
import { DownloadButton } from "./DownloadButton";
import { ImportExportButtons } from "./ImportExportButtons";
import mockAssets from './mocks/assets.json';
import { Skeleton } from "./ui/skeleton";

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

const CACHE_KEY = 'moralis_assets';
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

interface CacheData {
  timestamp: number;
  data: TokenBalance[];
}

function getCache(): CacheData | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const data = JSON.parse(cached) as CacheData;
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCache(data: TokenBalance[]) {
  const cacheData: CacheData = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

export function AssetAllocation({
  onAssetsUpdate,
  className
}: {
  onAssetsUpdate?: (assets: TokenBalance[]) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const { address, getMoralis } = useWallet();
  const [assets, setAssets] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10分钟刷新一次

  // 内部函数来处理异步数据加载
  const loadAssets = async () => {
    if (!address) return;
    const now = Date.now();
    if (now - lastFetch < REFRESH_INTERVAL && assets.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const Moralis = getMoralis();
      const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
        chain: "0x1",
        address: address,
      });

      const balances = response.json.result;
      if (!balances || balances.length === 0) {
        setError(t('asset.allocation.noAssets'));
        return;
      }

      const assetsWithHistory = await Promise.all(
        balances.map(async (token) => {
          try {
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - 7 * 24 * 60 * 60; // 7 days

            const historyData = await fetchPriceWithCache(
              token.symbol,
              startTime,
              endTime
            );

            // 即使没有历史数据，也返回基本信息
            return {
              symbol: token.symbol,
              name: token.name || token.symbol,
              balance: token.balance_formatted || '0',
              price: token.usd_price || 0,
              value: token.usd_value || 0,
              thumbnail: token.thumbnail || '/default-token-icon.png',
              priceHistory: Array.isArray(historyData) && historyData.length > 0
                ? (() => {
                  const sortedData = historyData
                    .map(item => ({
                      time: new Date(item.timestamp * 1000).toISOString().split('T')[0],
                      value: item.price || 0
                    }))
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                  // 使用 Map 去重
                  return [...new Map(
                    sortedData.map(item => [item.time, item])
                  ).values()];
                })()
                : undefined
            };
          } catch (error) {
            console.error(`Error processing token ${token.symbol}:`, error);
            return {
              symbol: token.symbol,
              name: token.name || token.symbol,
              balance: token.balance_formatted || '0',
              price: token.usd_price || 0,
              value: token.usd_value || 0,
              thumbnail: token.thumbnail || '/default-token-icon.png'
            };
          }
        })
      );
      setAssets(assetsWithHistory);
      setLastFetch(now);
      if (onAssetsUpdate && JSON.stringify(assetsWithHistory) !== JSON.stringify(assets)) {
        // 暂时用mock数据
        // onAssetsUpdate(mockAssets);
        onAssetsUpdate(assetsWithHistory);
      }
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(t('asset.allocation.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Effect 监听 address 和 lastFetch
  useEffect(() => {
    if (!address) {
      setIsLoading(true);
    }
    loadAssets(); // 调用内部异步函数
  }, [address, lastFetch]); // 只依赖 address 和 lastFetch

  // 添加定时刷新
  useEffect(() => {
    const interval = setInterval(() => {
      setLastFetch(0); // 触发重新加载
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const render = () => {
    if (isLoading) {
      return <Skeleton count={3} />
    }
    return (
      error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <div className="space-y-6 max-h-[500px] bg-gradient-to-b from-indigo-50/30 to-transparent dark:from-indigo-950/30 overflow-y-auto">
          {assets.map((asset) => (
            <Card
              key={asset.symbol}
              className="p-4 rounded-[2.5rem] border-4 border-white bg-[rgba(251,251,251,0.65)] shadow-[0px_4px_25.7px_0px_rgba(153,153,153,0.13)] backdrop-blur-[5px]"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 min-w-[100px]">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      src={asset.thumbnail || '/default-token-icon.png'}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: "PingFang SC" }}>{asset.name}</h3>
                    <div className="flex items-center space-x-2 text-base text-[#6D6C6C]">
                      <span>{asset.symbol}</span>
                      {" "}
                      <span>{parseFloat(asset.balance || '0').toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right min-w-[60px]">
                  <p className="text-lg font-semibold">
                    <span>$</span><span className="text-[#2C4BF5]">{(asset.price || 0).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${(asset.value || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>

                {asset.priceHistory && (
                  <div className="flex-1">
                    <AssetPriceChart
                      symbol={asset.symbol}
                      priceData={asset.priceHistory}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )
    );
  };

  return (
    <Card className="p-12">
      <div className="font-[700] text-[20px] leading-[37px] text-[#0F0F0F] font-sans mb-4">
        {t('asset.allocation.title')}
      </div>
      <div className="space-y-6">
        {render()}
      </div>
    </Card>
  );
}

async function fetchPriceWithCache(token: string, startTime: number, endTime: number) {
  const cached = getCachedPrice(token, startTime, endTime);
  if (cached) return cached;

  const historyResponse = await fetch('/api/chainlink/historical-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      startTime,
      endTime,
      interval: '1h'
    })
  });

  const data = await historyResponse.json();
  setCachedPrice(token, startTime, endTime, data);
  return data;
}
