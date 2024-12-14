import { createConfig } from 'wagmi';
import { lineaSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createStorage } from 'wagmi';

// 创建自定义存储，限制数据大小
const storage = createStorage({
  storage: {
    getItem: (key: string) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        // 如果数据太大，清理掉一些不必要的数据
        if (value.length > 2000000) { // 2MB 限制
          const data = JSON.parse(value);
          // 只保留必要的数据
          const trimmedData = {
            ...data,
            state: {
              ...data.state,
              blockNumber: undefined,
              transactions: []
            }
          };
          window.localStorage.setItem(key, JSON.stringify(trimmedData));
        } else {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // 如果还是失败，清空存储重试
        window.localStorage.clear();
        try {
          window.localStorage.setItem(key, value);
        } catch {
          console.warn('Failed to set wagmi store');
        }
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  },
});

export const config = createConfig(
  getDefaultConfig({
    appName: 'WalletMate',
    chains: [lineaSepolia],
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    storage,
  })
);