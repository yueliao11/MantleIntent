export default {
  common: {
    error: "错误",
    success: "成功",
    confirm: "确认",
    cancel: "取消",
    loading: "加载中...",
    send: "发送",
    noData: "暂无数据",
  },
  wallet: {
    connect: "连接钱包",
    connectError: "请安装 MetaMask",
    connecting: "连接中...",
    disconnect: "断开连接",
    insufficientBalance: "ADV代币余额不足",
    switchNetwork: "请切换到 AIA 测试网",
    connectionFailed: "连接钱包失败",
    overview: {
      totalValue: "投资组合总价值",
      dayChange: "24小时涨跌",
      noAssets: "您的钱包中暂无资产",
      consultWith: "咨询{{advisor}}",
      analyzing: "AI正在分析您的投资组合...",
      failedToGetAdvice: "获取建议失败，请稍后重试",
      pleaseConnectWallet: "请先连接钱包",
      assetAllocation: "资产分配",
      noFrog: "未检测到 eFrog NFT",
      frogHolder: "eFrog 持有者"
    }
  },
  asset: {
    allocation: {
      title: "钱包资产分布",
      loading: "加载资产中...",
      noAssets: "未找到任何资产",
      balance: "余额",
      value: "价值",
      priceChart: "价格走势",
      lastUpdated: "最后更新",
      refresh: "刷新",
      error: "加载资产失败"
    }
  },
  advisor: {
    unlock: {
      button: "解锁顾问",
      unlocking: "解锁中...",
      success: "解锁成功",
      failed: "解锁失败",
      confirm: "确认解锁",
      cancel: "取消",
    },
    conservative: {
      name: "稳健理财顾问",
      description: "专注于低风险、稳定收益的投资策略，适合保守型投资者"
    },
    growth: {
      name: "增长型顾问",
      description: "平衡风险与收益，追求中长期稳定增长"
    },
    quantitative: {
      name: "量化交易顾问",
      description: "使用高频交易策略，适合追求高收益的投资者"
    },
    meme: {
      name: "MEME币顾问",
      description: "基于ChainLink价格预言机和AI分析的MEME币投资建议"
    }
  },
  portfolio: {
    performance: "投资组合表现",
    value: "总价值",
    timeRange: "时间范围",
    day: "日",
    week: "周",
    month: "月",
    year: "年"
  },
  defi: {
    title: "AI 优选 DeFi",
    protocol: "协议",
    url: "协议地址",
    pool: "资金池",
    liquidity: "流动性",
    volume: "交易量(24H)",
    apy: "APY",
    aiAdvice: "AI建议",
    action: "操作",
    invest: "去投资",
    loading: {
      pools: "正在获取 DeFi 收益池数据...",
      analysis: "正在分析最优收益方案...",
      results: "正在整理推荐结果..."
    }
  },
  frog: {
    notDetected: "未检测到 eFrogNFT",
    detected: "已检测到 eFrogNFT"
  }
};