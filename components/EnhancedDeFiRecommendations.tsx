"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, TrendingUp } from "lucide-react";
import { useWallet } from "@/lib/WalletContext";
import { useI18n } from '@/lib/i18n/I18nContext';
import { fetchPoolData } from '@/lib/defi/llamaApi';
import { Table, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface EnhancedProtocol {
  name: string;
  icon?: string;
  poolTokens?: {
    symbol: string;
    icon: string;
  }[];
  apy: number;
  tvl: number;
  volume: number;
  riskLevel: string;
  aiAnalysis: string;
  url?: string;
}

export function EnhancedDeFiRecommendations() {
  const { t } = useI18n();
  const { address } = useWallet();
  const [protocols, setProtocols] = useState<EnhancedProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnhancedData();
  }, []);

  async function fetchEnhancedData() {
    try {
      setLoading(true);
      setError(null);

      setLoadingStep(t('defi.loading.pools'));
      const poolData = await fetchPoolData();

      if (!poolData || poolData.length === 0) {
        throw new Error('无法获取 DeFi 数据');
      }

      setLoadingStep(t('defi.loading.analysis'));
      const analysis = await fetch('/api/defi-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocols: poolData })
      }).then(r => r.json());
      if (analysis.error) {
        throw new Error(analysis.error);
      }

      if (!analysis.recommendations?.length) {
        throw new Error('未找到合适的推荐方案');
      }

      setLoadingStep(t('defi.loading.results'));
      setProtocols(analysis.recommendations);
    } catch (error) {
      console.error('Enhanced DeFi data fetch failed:', error);
      setError(error instanceof Error ? error.message : '获取数据失败');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* <TrendingUp className="h-4 w-4 text-primary" /> */}
          <h2 className="text-lg font-bold">{t('defi.title')}</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm text-muted-foreground">{loadingStep}</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-[rgba(251,251,251,0.8)] shadow-[0px_4px_25.7px_rgba(153,153,153,0.13)] backdrop-blur-sm !border-b-0">
                <TableHead className="rounded-tl-2xl rounded-bl-2xl">{t("defi.protocol")}</TableHead>
                <TableHead >{t("defi.url")}</TableHead>
                <TableHead >{t("defi.liquidity")}</TableHead>
                <TableHead >{t("defi.apy")}</TableHead>
                <TableHead className="rounded-tr-2xl rounded-br-2xl">{t("defi.aiAdvice")}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {protocols.map((protocol) => (
                <TableRow key={protocol.name} className="border-b hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://icons.llamao.fi/icons/protocols/${protocol.name.toLowerCase()}?w=48&h=48`}
                        alt={protocol.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/protocols/default.png";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      className="py-2 px-3 text-sm font-semibold rounded-xl min-w-fit bg-[var(--btn2-bg)] whitespace-nowrap hover:bg-[var(--btn2-hover-bg)] text-[var(--text1)] flex items-center gap-1"
                      href={protocol.url}>
                      {protocol.name}<img alt="visit" src="/visit.svg" className="w-[15px] h-[15px]" />
                    </a>
                  </TableCell>
                  <TableCell>${protocol.tvl.toLocaleString()}</TableCell>
                  <TableCell className=" text-green-500">{protocol.apy.toFixed(2)}%</TableCell>
                  <TableCell className="p-2 text-sm">{protocol.aiAnalysis}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}