import { openai } from '@/lib/openai-config';
import { ADVISOR_PROMPTS } from '@/lib/advisorPrompts';
import { ethers } from 'ethers';

// Mantle生态DeFi协议列表
const MANTLE_PROTOCOLS = {
  lending: [
    { 
      name: 'Agni Finance',
      address: '0x7Bf2F5D44497A7e3FC48AD32F6c4CC22EA5685Cf',
      url: 'https://app.agni.finance',
      apy: 12,
      tvl: 150000000,
      isWhitelisted: true
    },
    {
      name: 'Flux Finance',
      address: '0x8F8f2FC1F9F1405d9356633b97B67DE10CeF2B47', 
      url: 'https://flux.finance',
      apy: 8,
      tvl: 80000000,
      isWhitelisted: true
    }
  ],
  dex: [
    {
      name: 'Fusionist',
      address: '0x5E2f2498F1CA895d2f8F16F10D5C94999b76bB27',
      url: 'https://fusionist.finance',
      apy: 15,
      tvl: 200000000,
      isWhitelisted: true
    },
    {
      name: 'Cleopatra',
      address: '0x9E2Aa514F3F183E0755cB5FAF5F4D81338d5D083',
      url: 'https://cleopatra.exchange',
      apy: 20,
      tvl: 100000000,
      isWhitelisted: true
    }
  ]
};

// 添加检查白名单状态的函数
const checkWhitelisted = async (contract: ethers.Contract, protocol: any) => {
  try {
    const url = await contract.getProtocolUrl(protocol.address);
    return url === protocol.url;
  } catch {
    return false;
  }
};

interface UserIntent {
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  investmentGoals: string[];
}

export async function analyzeUserIntent(userMessage: string): Promise<UserIntent> {
  const completion = await openai.chat.completions.create({
    model: "yi-large",
    messages: [
      {
        role: "system",
        content: ADVISOR_PROMPTS.intentAnalysis
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });
  
  return JSON.parse(completion.choices[0].message.content);
}

export const analyzeDeFiIntent = async (
  userIntent: string,
  contract: ethers.Contract
) => {
  try {
    // 过滤出已白名单的协议
    const whitelistedProtocols = [];
    for (const category in MANTLE_PROTOCOLS) {
      for (const protocol of MANTLE_PROTOCOLS[category]) {
        if (await checkWhitelisted(contract, protocol)) {
          whitelistedProtocols.push(protocol);
        }
      }
    }

    // 只分析白名单内的协议
    const analyzedProtocols = await analyzeProtocols(
      userIntent, 
      whitelistedProtocols
    );

    return {
      recommendations: analyzedProtocols,
      userIntent
    };
  } catch (error) {
    console.error('DeFi analysis failed:', error);
    return { recommendations: [], userIntent };
  }
};

function filterProtocolsByIntent(protocols: any[], intent?: UserIntent) {
  if (!intent) return protocols;
  
  return protocols.filter(p => {
    const risk = calculateRisk(p.tvl, p.apy);
    if (intent.riskLevel === 'conservative' && risk === '高') return false;
    if (intent.riskLevel === 'aggressive' && risk === '低') return false;
    return true;
  });
}

function calculateConfidence(tvl: number, apy: number): number {
  if (tvl > 1000000000) return 90;
  if (tvl > 100000000) return 75;
  if (tvl > 10000000) return 60;
  return 40;
}

function calculateRisk(tvl: number, apy: number): string {
  if (tvl > 1000000000 && apy < 20) return '低';
  if (tvl > 100000000 && apy < 50) return '中';
  return '高';
}