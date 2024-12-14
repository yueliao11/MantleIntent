"use client";

import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Binary, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvisorType } from "@/types/advisor";
import { useI18n } from '@/lib/i18n/I18nContext';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
import { ADVISOR_ADDRESS, ADVISOR_ABI } from "@/config/contracts";
import { useState } from "react";
import Image from "next/image";
import { useEthersContract } from "@/hooks/useEthersContract";


interface AdvisorSelectionProps {
  onAdvisorSelect: (advisorType: AdvisorType) => void;
}

export function AdvisorSelection({ onAdvisorSelect }: AdvisorSelectionProps) {
  const { t } = useI18n();
  const { address, unlockAdvisor, unlockingAdvisor, checkAccess } = useEthersContract();

  const advisors = [
    {
      type: "conservative" as AdvisorType,
      icon: Shield,
      title: t('advisor.conservative.name'),
      description: t('advisor.conservative.description'),
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
    },
    {
      type: "growth" as AdvisorType,
      icon: TrendingUp,
      title: t('advisor.growth.name'),
      description: t('advisor.growth.description'),
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      type: "quantitative" as AdvisorType,
      icon: Binary,
      title: t('advisor.quantitative.name'),
      description: t('advisor.quantitative.description'),
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
    },
    {
      type: "meme" as AdvisorType,
      icon: Sparkles,
      title: t('advisor.meme.name'),
      description: t('advisor.meme.description'),
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
    }
  ];

  const handleAdvisorClick = async (advisorType: AdvisorType) => {
    console.log('Clicking advisor:', advisorType);
    try {
      if (!address) {
        console.log('No wallet connected');
        alert("请先连接钱包");
        return;
      }

      console.log('Checking access for:', advisorType);
      const hasAccess = await checkAccess(advisorType);
      console.log('Has access:', hasAccess);

      if (!hasAccess) {
        console.log('Unlocking advisor:', advisorType);
        await unlockAdvisor(advisorType);
        console.log('Checking access again for:', advisorType);
        const accessGranted = await checkAccess(advisorType);
        console.log('Access granted:', accessGranted);
        if (!accessGranted) {
          return;
        }
      }
      onAdvisorSelect(advisorType);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {advisors.map((advisor) => (
        <Card key={advisor.type} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image 
                  src={advisor.image}
                  alt={advisor.title}
                  fill
                  className="object-cover"
                />
              </div>
              <advisor.icon className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">{advisor.title}</h3>
                <p className="text-sm text-gray-500">{advisor.description}</p>
              </div>
            </div>
            <Button onClick={() => onAdvisorSelect(advisor.type)}>
              {t('advisor.select')}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
