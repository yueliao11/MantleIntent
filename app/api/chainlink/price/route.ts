import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface PriceFeeds {
  [key: string]: string;  // 添加索引签名
  PEPE: string;
  WIF: string;
  BONK: string;
}

const PRICE_FEEDS: PriceFeeds = {
  PEPE: "0x...", // Chainlink price feed address
  WIF: "0x...",
  BONK: "0x..."
};

const ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

export async function POST(req: Request) {
  try {
    const { symbol } = await req.json();
    
    if (!PRICE_FEEDS[symbol as keyof PriceFeeds]) {
      return NextResponse.json(
        { error: `No price feed available for ${symbol}` },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const priceFeed = new ethers.Contract(PRICE_FEEDS[symbol as keyof PriceFeeds], ABI, provider);

    const roundData = await priceFeed.latestRoundData();
    const price = Number(ethers.formatUnits(roundData.answer, 8));
    
    // Calculate 24h change (mock data for now)
    const change24h = Math.random() * 20 - 10; // Random value between -10 and 10

    return NextResponse.json({
      price,
      change24h
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
} 