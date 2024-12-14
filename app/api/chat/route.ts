import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai-config';

interface AdvisorPrompts {
  [key: string]: string;
  conservative: string;
  growth: string;
  quantitative: string;
  meme: string;
}

const ADVISOR_PROMPTS: AdvisorPrompts = {
  conservative: `You are a conservative investment advisor...`,
  growth: `You are a growth-focused cryptocurrency investment advisor...`,
  quantitative: `You are an expert in quantitative trading strategies...`,
  meme: `You are a specialist in analyzing MEME tokens...`
};

interface Asset {
  name: string;
  symbol: string;
  balance: string;
  value: number | null;
}

export async function POST(request: Request) {
  try {
    const { messages, advisorType, assets } = await request.json();
    
    const assetContext = assets ? `\n当前资产组合:\n${JSON.stringify(assets, null, 2)}` : '';
    
    const completion = await openai.chat.completions.create({
      model: "yi-large",
      messages: [
        { 
          role: "system", 
          content: ADVISOR_PROMPTS[advisorType as keyof AdvisorPrompts] + (assetContext || '')
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return NextResponse.json({ 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get advisor response' },
      { status: 500 }
    );
  }
} 