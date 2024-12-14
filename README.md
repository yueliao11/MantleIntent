# MantleIntent - 基于意图的 Mantle DeFi 聚合器

MantleIntent 是一个创新的 DeFi 聚合平台,使用 AI 理解用户投资意图,智能推荐 Mantle 生态最优 DeFi 策略。

## 核心特性
- 🤖 AI 驱动的意图分析
- 🔄 一键式 DeFi 策略执行  
- 📊 智能风险评估
- 🌐 深度整合 Mantle 生态

## 1. 核心页面组件
### 1.1 主页面 (app/page.tsx)
```typescript
主要功能：
- 整合所有主要组件
- 管理顾问聊天窗口状态
- 实现响应式布局
- 集成钱包连接功能

关键组件：
- WalletOverview：钱包总览
- PortfolioChart：投资组合图表
- AssetAllocation：资产分配
- AdvisorSelection：顾问选择
- ConnectWallet：钱包连接
- FloatingAdvisorChat：浮动顾问聊天
1.2 钱包概览组件 (components/WalletOverview.tsx)
Edit:
README.md

主要功能：
- 3D 饼图展示资产分布
- 使用 ECharts-GL 实现高级可视化
- 实时更新钱包余额
- 显示资产价值变化

技术特点：
- 使用参数方程实现 3D 效果
- 支持交互式高亮和选中
- 响应式设计适配
1.3 资产分配组件 (components/AssetAllocation.tsx)

主要功能：
- 显示代币余额和价值
- 集成 Moralis API 获取代币数据
- 通过 Chainlink 获取历史价格
- 自动刷新资产数据

关键特性：
- 10分钟自动刷新
- 支持价格历史图表
- 错误处理和加载状态
2. Web3 集成
2.1 智能合约交互 Hook (hooks/useEthersContract.ts)

主要功能：
- 管理钱包连接状态
- 处理智能合约交互
- 实现顾问解锁功能
- 管理 ADV 代币支付

关键方法：
- checkAccess：检查顾问访问权限
- unlockAdvisor：解锁新顾问
- 支持 MetaMask 事件监听
2.2 其他重要 Hooks

1. useAdvisorContract.ts
- 管理顾问智能合约交互
- 处理顾问相关的链上操作

2. useAssetHistory.ts
- 获取资产价格历史数据
- 处理数据格式化和缓存

3. useMemeMarket.ts
- 处理 Meme 市场相关功能
- 管理 Meme 代币交易
3. UI 组件库

包含多个基础 UI 组件：
- Card：卡片容器
- Dialog：对话框
- Button：按钮
- Toast：通知提示
等等...

特点：
- 基于 Radix UI
- 支持深色模式
- 完全类型安全
- 可定制主题
4. 数据流和状态管理

主要状态管理方式：
1. React Hooks
- useState 管理本地状态
- useEffect 处理副作用
- 自定义 hooks 封装业务逻辑

2. 上下文管理
- WalletContext：钱包状态
- ThemeContext：主题状态
5. API 文档
5.1 价格数据 API
获取代币历史价格

POST /api/chainlink/historical-price
请求参数：


{
  "token": "string",     // 代币符号（例如：'BTC'）
  "startTime": number,   // 起始时间戳（秒）
  "endTime": number,     // 结束时间戳（秒）
  "interval": string     // 时间间隔（'1h' 或 '1d'）
}
响应：


[
  {
    "timestamp": number,  // 时间戳
    "price": number      // 价格（USD）
  }
]
错误处理���

如果发生错误，返回空数组 []
需要配置 CRYPTOCOMPARE_API_KEY 环境变量
5.2 AI 顾问聊天 API
获取 AI 顾问回复

POST /api/chat
请求参数：


{
  "messages": [          // 聊天历史
    {
      "role": "user" | "assistant",
      "content": string
    }
  ],
  "advisorType": string, // 顾问类型
  "assets": [            // 当前资产组合（可选）
    {
      "name": string,
      "symbol": string,
      "balance": string,
      "value": number | null
    }
  ]
}
顾问类型：

conservative: 保守型投资顾问
专注稳定收益和风险管理
推荐成熟的 DeFi 协议
提供稳定币策略
growth: 增长型投资顾问
关注市值前 20 的加密货币
分析市场趋势
提供投资组合配置建议
quantitative: 量化交易顾问
技术分析专家
识别交易机会
提供风险管理技巧
meme: Meme 代币专家
分析社交媒体趋势
评估代币经济模型
提供高风险高回报机会分析
响应：

Edit:
README.md
+175
-153
 191
Preview
Apply
{
  "message": string  // AI 顾问的回复内容
}
错误响应：


{
  "error": "Internal server error"
}
5.3 市场数据 API
CoinCap API 集成

/api/coincap/
用于获取实时市场数据和价格信息

CryptoCompare API 集成

/api/cryptocompare/
用于获取更详细的市场数据和交易信息

Meme 市场 API

/api/meme/
专门用于 Meme 代币市场的数据和分析

6. 环境变量配置
项目需要配置以下环境变量：


CRYPTOCOMPARE_API_KEY=   # CryptoCompare API 密钥
OPENAI_API_KEY=         # OpenAI API 密钥
COINCAP_API_KEY=        # CoinCap API 密钥
7. API 使用建议
7.1 错误处理
所有 API 调用都应该包含适当的错误处理
使用 try-catch 块捕获可能的异常
检查响应状态和数据完整性
7.2 速率限制
注意各个第三方 API 的速率限制
实现适当的缓存机制
避免频繁的 API 调用
7.3 数据验证
验证所有输入参数
检查数据类型和格式
处理边界情况
7.4 安全性
不要在前端暴露 API 密钥
实现适当的认证机制
保护敏感数据
8. 示例代码
获取历史价格数据：

const response = await fetch('/api/chainlink/historical-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'ETH',
    startTime: Math.floor(Date.now() / 1000) - 7 * 24 * 3600,
    endTime: Math.floor(Date.now() / 1000),
    interval: '1h'
  })
});

const prices = await response.json();
使用 AI 顾问：

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '如何优化我的 DeFi 投资组合？' }],
    advisorType: 'conservative',
    assets: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        balance: '1.5',
        value: 3000
      }
    ]
  })
});

const { message } = await response.json();

