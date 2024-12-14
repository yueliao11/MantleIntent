"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, CheckCircle, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletContext";
import { useI18n } from '@/lib/i18n/I18nContext';
import { VerificationService } from '@/services/verificationService';

interface DeFiProtocol {
  name: string;
  apy: number;
  tvl: number;
  address: string;
  tokens: string[];
  isVerified: boolean;
  verificationLoading: boolean;
  attestationId?: string;
  url?: string;
}

interface LoadingState {
  yields: boolean;
  tokens: boolean;
  verification: boolean;
}

export function DeFiRecommendations() {
  const { t } = useI18n();
  const { address, provider, signer } = useWallet();
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationService, setVerificationService] = useState<VerificationService>();

  useEffect(() => {
    if (provider && signer) {
      const service = new VerificationService(provider);
      service.initializePortal(signer);
      setVerificationService(service);
    }
  }, [provider, signer]);

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // 从 DefiLlama API 获取收益数据
      const yieldsResponse = await fetch('https://api.defillama.com/v1/yields?chain=mantle');
      const yieldsData = await yieldsResponse.json();
      
      setLoading(false);

      // 获取用户钱包中的代币
      const userTokensResponse = await fetch(`https://api.defillama.com/v1/wallets/${address}/tokens`);
      const userTokens = await userTokensResponse.json();
      const userTokenSymbols = userTokens.map((t: any) => t.symbol.toUpperCase());

      // 处理和筛选收益数据
      const processedProtocols = yieldsData
        .filter((p: any) => p.tvl > 1000000 && p.apy > 0)
        .map((p: any) => ({
          name: p.name,
          apy: p.apy,
          tvl: p.tvl,
          address: p.pool,
          tokens: [p.token.toUpperCase()],
          url: p.url,
          isVerified: false,
          verificationLoading: false
        }));

      // 匹配用户持有的代币的协议
      const matchedProtocols = processedProtocols
        .filter(p => p.tokens.some(t => userTokenSymbols.includes(t)))
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 4);

      // 如果匹配的协议不足4个，补充高收益协议
      let protocolsToShow = matchedProtocols;
      if (matchedProtocols.length < 4) {
        const remainingCount = 4 - matchedProtocols.length;
        const highYieldProtocols = processedProtocols
          .filter(p => !matchedProtocols.find(m => m.address === p.address))
          .sort((a, b) => b.apy - a.apy)
          .slice(0, remainingCount);
        
        protocolsToShow = [...matchedProtocols, ...highYieldProtocols];
      }

      // 缓存数据
      localStorage.setItem('defi_protocols', JSON.stringify({
        timestamp: Date.now(),
        data: protocolsToShow
      }));

      setProtocols(protocolsToShow);
    } catch (error) {
      console.error('Failed to fetch DeFi data:', error);
    } finally {
      setLoading(false);
    }
  }

  const verifyProtocol = async (protocol: any, index: number) => {
    if (!verificationService) return;
    
    setProtocols(prev => prev.map((p, i) => 
      i === index ? { ...p, verificationLoading: true } : p
    ));

    try {
      const verification = await verificationService.verifyContract(
        protocol.address,
        protocol.sourceCode || '',
        {
          name: protocol.name,
          version: protocol.version,
          tvl: protocol.tvl,
          apy: protocol.apy
        }
      );

      setProtocols(prev => prev.map((p, i) => 
        i === index ? { 
          ...p, 
          isVerified: verification.status === 'VERIFIED',
          verificationLoading: false,
          attestationId: verification.attestationId
        } : p
      ));
    } catch (error) {
      console.error('Verification failed:', error);
      setProtocols(prev => prev.map((p, i) => 
        i === index ? { ...p, verificationLoading: false } : p
      ));
    }
  };

  const LoadingMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-sm text-muted-foreground space-y-2">
        {loading && <p>正在获取 DeFi 收益数据...</p>}
        {loading && <p>正在获取钱包代币信息...</p>}
        {loading && <p>正在验证协议安全性...</p>}
      </div>
    </div>
  );

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">DeFi 机会</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {protocols.map((protocol, index) => (
              <div key={protocol.name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{protocol.name}</h3>
                      {protocol.url && (
                        <a 
                          href={protocol.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          查看详情
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>APY: {protocol.apy.toFixed(2)}%</span>
                      <span>TVL: ${protocol.tvl.toLocaleString()}</span>
                      <span>代币: {protocol.tokens.join(', ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => verifyProtocol(protocol, index)}
                    disabled={protocol.verificationLoading || protocol.isVerified}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs"
                  >
                    {protocol.verificationLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : protocol.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">已验证</span>
                      </>
                    ) : (
                      <span>验证</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// 风险评估函数
function calculateRisk(tvl: number, apy: number): 'low' | 'medium' | 'high' {
  if (tvl > 1000000000 && apy < 20) return 'low';
  if (tvl > 100000000 && apy < 50) return 'medium';
  return 'high';
}