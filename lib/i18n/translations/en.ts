export default {
  common: {
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    cancel: "Cancel",
    loading: "Loading...",
    send: "Send",
    noData: "No Data",
  },
  wallet: {
    connect: "Connect Wallet",
    connectError: "Please install MetaMask",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    insufficientBalance: "Insufficient ADV token balance",
    switchNetwork: "Please switch to AIA Testnet",
    connectionFailed: "Failed to connect wallet",
    overview: {
      totalValue: "Portfolio Total Value",
      defi: "Defi Recommend",
      dayChange: "24h Change",
      noAssets: "No assets in your wallet",
      consultWith: "Consult with {{advisor}}",
      analyzing: "AI is analyzing your portfolio...",
      failedToGetAdvice: "Failed to get advice, please try again later",
      pleaseConnectWallet: "Please connect wallet first",
      assetAllocation: "Asset Allocation",
      noFrog: "No eFrog NFT detected",
      frogHolder: "eFrog Holder"
    }
  },
  asset: {
    title: 'Wallet Assets',
    allocation: {
      title: "Wallet Asset Distribution",
      loading: "Loading assets...",
      noAssets: "No assets found",
      balance: "Balance",
      value: "Portfolio Total Value",
      priceChart: "Price Chart",
      lastUpdated: "Last Updated",
      refresh: "Refresh",
      error: "Failed to load assets"
    }
  },
  investment: {
    title: "Investment Advice",
  },
  ai: {
    title: "AI functionality"
  },
  advisor: {
    title: 'AI Advisor',
    unlock: {
      button: "Unlock Advisor",
      unlocking: "Unlocking...",
      success: "Unlock successful",
      failed: "Unlock failed",
      confirm: "Confirm unlock",
      cancel: "Cancel",
    },
    conservative: {
      name: "Conservative Advisor",
      description: "Focus on low-risk, stable returns, suitable for conservative investors"
    },
    growth: {
      name: "Growth Advisor",
      description: "Balance risk and return, pursue stable medium to long-term growth"
    },
    quantitative: {
      name: "Quantitative Advisor",
      description: "Use high-frequency trading strategies, suitable for investors seeking high returns"
    },
    meme: {
      name: "MEME Token Advisor",
      description: "MEME token investment advice based on ChainLink price oracle and AI analysis"
    }
  },
  portfolio: {
    performance: "Portfolio Performance",
    value: "Wallet Assets",
    timeRange: "Time Range",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year"
  },
  meme: {
    memeAnalysis: 'MEME Analysis'
  },
  defi: {
    title: "AI Selected DeFi",
    protocol: "Protocol",
    url: "Website",
    pool: "Pool",
    liquidity: "Liquidity", 
    volume: "Volume(24H)",
    apy: "APY",
    aiAdvice: "AI Advice",
    action: "Action",
    invest: "Invest",
    loading: {
      pools: "Fetching DeFi yield pools...",
      analysis: "Analyzing optimal yield strategies...", 
      results: "Organizing recommendations..."
    }
  },
  frog: {
    notDetected: "eFrogNFT Not Detected",
    detected: "eFrogNFT Detected"
  }
};