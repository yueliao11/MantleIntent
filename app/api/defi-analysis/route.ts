import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai-config';
import { ADVISOR_PROMPTS } from '@/lib/advisorPrompts';

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

export async function POST(request: Request) {
  try {
    console.log('API: 开始处理请求...');
    const { protocols } = await request.json();
    console.log('API: 收到协议数据:', protocols?.length || 0, '条记录');
    
    if (!protocols || !Array.isArray(protocols)) {
      console.error('无效的协议数据');
      return NextResponse.json({ 
        error: '无效的协议数据' 
      }, { status: 400 });
    }

    const filteredProtocols = protocols
      .filter((p: any) => {
        return p && 
               typeof p.tvl === 'number' && 
               !isNaN(p.tvl) &&
               typeof p.apy === 'number' && 
               !isNaN(p.apy) &&
               p.tvl >= 100000 &&
               p.apy > 0 &&
               p.apy < 1000;
      })
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 5);
    console.log('API: 筛选后协议数:', filteredProtocols.length);
    
    if (filteredProtocols.length === 0) {
      console.log('没有符合条件的协议');
      return NextResponse.json({
        recommendations: [],
        analysis: "未找到符合条件的 DeFi 协议",
        riskLevel: 'medium'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('API: OpenAI API Key 未设置，返回基础分析');
      return NextResponse.json({
        recommendations: filteredProtocols.map((p: any) => ({
          name: p.name,
          apy: p.apy,
          tvl: p.tvl,
          riskLevel: calculateRisk(p.tvl, p.apy),
          aiAnalysis: "AI 分析暂时不可用",
          confidence: calculateConfidence(p.tvl, p.apy)
        }))
      });
    }

    console.log('API: 调用 OpenAI 分析...');
    return NextResponse.json({
      recommendations: await Promise.all(filteredProtocols.map(async (p: any) => {
        const analysis = await openai.chat.completions.create({
          model: "yi-large",
          messages: [
            {
              role: "system",
              content: "你是一位专业的 DeFi 投资顾问。请用不超过15字简要分析该协议的优势或风险。"
            },
            {
              role: "user",
              content: `分析该DeFi协议:\n名称: ${p.name}\nTVL: ${p.tvl}\nAPY: ${p.apy}%\n交易量: ${p.volume || 0}`
            }
          ]
        });

        return {
          name: p.name,
          apy: p.apy,
          tvl: p.tvl,
          volume: p.volume || 0,
          icon: p.icon || `/protocols/${p.name.toLowerCase()}.png`,
          poolTokens: p.tokens?.map((token: string) => ({
            symbol: token,
            icon: `/tokens/${token.toLowerCase()}.png`
          })) || [],
          riskLevel: calculateRisk(p.tvl, p.apy),
          aiAnalysis: analysis.choices[0].message.content,
          url: p.url || `https://defillama.com/protocol/${p.name.toLowerCase()}`
        };
      }))
    });
  } catch (error) {
    console.error('API: DeFi 分析失败:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}