import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@/lib/openai-config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { symbol, price, change24h, volume24h, marketCap } = req.body;

    // 格式化数字
    const formatPrice = price.toFixed(8);
    const formatVolume = (volume24h / 1000000).toFixed(2); // 转换为百万
    const formatMarketCap = (marketCap / 1000000).toFixed(2); // 转换为百万

    const completion = await openai.chat.completions.create({
      model: "yi-large",
      messages: [
        {
          role: "system",
          content: `You are a cryptocurrency market analyst specializing in MEME tokens. 
          Please provide detailed analysis considering:
          - Price movement and momentum
          - Trading volume and market activity
          - Market capitalization and project scale
          - Overall market sentiment
          - Potential risks and opportunities
          Keep the analysis concise but informative.`
        },
        {
          role: "user",
          content: `Please analyze the market sentiment for ${symbol} with:
          - Current price: $${formatPrice}
          - 24h change: ${change24h.toFixed(2)}%
          - 24h trading volume: $${formatVolume}M
          - Market cap: $${formatMarketCap}M
          
          Provide a comprehensive analysis including:
          1. Current market sentiment
          2. Volume analysis
          3. Market cap evaluation
          4. Short-term outlook
          5. Key risks to watch`
        }
      ],
      temperature: 0.7, // 增加一些创造性
      max_tokens: 500  // 允许更长的回复
    });

    return res.status(200).json({ 
      sentiment: completion.choices[0].message.content,
      data: {
        price: formatPrice,
        change24h: change24h.toFixed(2),
        volume24h: formatVolume,
        marketCap: formatMarketCap
      }
    });
  } catch (error) {
    console.error("Error getting sentiment:", error);
    return res.status(500).json({ error: "Failed to get sentiment analysis" });
  }
}