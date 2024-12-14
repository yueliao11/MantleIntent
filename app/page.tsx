"use client";

import { WalletOverview } from '@/components/WalletOverview';
import { PortfolioChart } from '@/components/PortfolioChart';
import { AssetAllocation } from '@/components/AssetAllocation';
import { AdvisorSelection } from '@/components/AdvisorSelection';
import { ConnectWallet } from '@/components/ConnectWallet';
import { FloatingAdvisorChat } from '@/components/FloatingAdvisorChat';
import { MemeMarquee } from '@/components/MemeMarquee';
import { EnhancedDeFiRecommendations } from '@/components/EnhancedDeFiRecommendations';
import { useState } from 'react';
import { PoolTable } from '@/components/PoolTable';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MagicCard } from '@/components/ui/magic-card';
import Image from 'next/image';

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

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AVAILABLE_ADVISORS = [
  "conservative",
  "growth",
  "quantitative",
  "meme"
] as const;

type AdvisorType = typeof AVAILABLE_ADVISORS[number];

interface ChatWindow {
  advisorType: AdvisorType;
  isVisible: boolean;
  messages: Message[];
}

export default function Home() {
  const [chatWindows, setChatWindows] = useState<Record<string, ChatWindow>>({});
  const [currentAssets, setCurrentAssets] = useState<TokenBalance[]>([]);
  const { t } = useI18n();
  const handleAdvisorSelect = (advisorType: AdvisorType) => {
    console.log('Home: handleAdvisorSelect called with:', advisorType);
    console.log('Current chatWindows:', chatWindows);

    setChatWindows(prev => {
      const newWindows = { ...prev };
      console.log('Processing windows:', newWindows);

      // 隐藏其他顾问的窗口
      Object.keys(newWindows).forEach(key => {
        newWindows[key].isVisible = key === advisorType;
      });

      // 如果该顾问窗口不存在，创建新窗口
      if (!newWindows[advisorType]) {
        console.log('Creating new window for:', advisorType);
        newWindows[advisorType] = {
          advisorType,
          isVisible: true,
          messages: []
        };
      } else {
        console.log('Showing existing window for:', advisorType);
        newWindows[advisorType].isVisible = true;
      }

      console.log('Final windows state:', newWindows);
      return newWindows;
    });
  };

  const handleCloseChat = (advisorType: AdvisorType) => {
    setChatWindows(prev => ({
      ...prev,
      [advisorType]: {
        ...prev[advisorType],
        isVisible: false
      }
    }));
  };

  const handleUpdateMessages = (advisorType: AdvisorType, messages: Message[]) => {
    setChatWindows(prev => ({
      ...prev,
      [advisorType]: {
        ...prev[advisorType],
        messages
      }
    }));
  };

  console.log('Home: Rendering with chatWindows:', chatWindows);

  return (
    <main className="min-h-screen bg-cover bg-center p-6 md:p-8" style={{ backgroundImage: "url('/background.png')" }}>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MantleIntent</h1>
            <p className="font-sans font-normal leading-[28px] text-[#434343]">AI understands your investment intent and recommends optimal Mantle DeFi strategies</p>
          </div>
          <ConnectWallet />
        </div>
        <Card className='bg-[rgba(251,251,251,0.30)]'>
          <Tabs defaultValue="overview" className="w-full my-2">
            <TabsList>
              <TabsTrigger value="overview" className="w-[250px]">Portfolio Overview</TabsTrigger>
              <TabsTrigger value="history" className="w-[250px]">Account History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2 pb-5">
                <WalletOverview />
                <AssetAllocation onAssetsUpdate={setCurrentAssets} />
              </div>
            </TabsContent>
            <TabsContent value="history">
              <PortfolioChart />
            </TabsContent>
          </Tabs>
        </Card>
        <Card className='bg-[rgba(251,251,251,0.30)]'>
          <Tabs defaultValue="defi" className="w-full my-2">
            <TabsList>
              <TabsTrigger value="defi" className="w-[250px]">{t("investment.title")}</TabsTrigger>
            </TabsList>
            <TabsContent value="defi">
              <div className="grid gap-6 md:grid-cols-2 pb-5 grid-rows-[minmax(100px, 600px)]">
                <PoolTable />
                <MemeMarquee />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        <Card className='bg-[rgba(251,251,251,0.30)]'>
          <Tabs defaultValue="ai" className="w-full my-2">
            <TabsList>
              <TabsTrigger value="ai" className="w-[250px]">{t("ai.title")}</TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="space-y-6">
                  <AdvisorSelection onAdvisorSelect={handleAdvisorSelect} />
                </Card>
                <Card>
                  <EnhancedDeFiRecommendations />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {Object.entries(chatWindows).map(([type, window]) => (
          window.isVisible && (
            <FloatingAdvisorChat
              key={type}
              advisorType={type}
              assets={currentAssets}
              messages={window.messages}
              onMessagesUpdate={(messages) => handleUpdateMessages(type, messages)}
              onClose={() => handleCloseChat(type)}
            />
          )
        ))}
      </div>
    </main>
  );
}
