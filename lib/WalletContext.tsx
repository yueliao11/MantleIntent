"use client";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { VeraxSdk } from '@verax-attestation-registry/verax-sdk';
import { TESTNET_EFROGS_CONTRACT, TESTNET_PORTAL_ADDRESS, TRANSACTION_VALUE } from '@/lib/constants';
import { useAccount, useReadContract, WagmiProvider } from 'wagmi';
import { lineaSepolia } from 'wagmi/chains';
import { wagmiConfig } from '../config/wagmi';

interface WalletContextType {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  tokens: any[];
  // efrogCount: number;
  // isCheckingEfrog: boolean;
  // readEfrogContractSuccess: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  getMoralis: () => typeof Moralis;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface CachedData {
  timestamp: number;
  data: any;
}

interface TokenCache {
  [address: string]: CachedData;
}

//const TESTNET_EFROGS_CONTRACT = '0x35c134262605bc69B3383EA132A077d09d8df061';
const PORTAL_ADDRESS = '0x0Cb56F201E7aFe02E542E2D2D42c34d4ce7203F7';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isMoralisInitialized, setIsMoralisInitialized] = useState(false);
  const [tokenCache, setTokenCache] = useState<TokenCache>({});
  const [efrogCount, setEfrogCount] = useState<number>(0);
  const [veraxSdk, setVeraxSdk] = useState<VeraxSdk>();
  const { address: wagmiAddress } = useAccount();
  const [shouldCheckEfrog, setShouldCheckEfrog] = useState(false);
  const [hasCheckedEfrog, setHasCheckedEfrog] = useState(false);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

  const getCachedTokens = (address: string) => {
    const cached = tokenCache[address];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const setCachedTokens = (address: string, data: any) => {
    setTokenCache(prev => ({
      ...prev,
      [address]: {
        timestamp: Date.now(),
        data
      }
    }));
  };

  const initializeMoralis = async () => {
    if (!Moralis.Core.isStarted) {
      const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
      if (!apiKey) {
        throw new Error('Moralis API key not found');
      }
      await Moralis.start({
        apiKey,
      });
      setIsMoralisInitialized(true);
    }
  };

  const getMoralis = () => {
    if (!isMoralisInitialized) {
      throw new Error('Moralis not initialized');
    }
    return Moralis;
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      connect();
    }
  }, []);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('请安装 MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      setShouldCheckEfrog(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      const balance = await provider.getBalance(address);

      setAddress(address);
      setBalance(ethers.formatEther(balance));

      // 清理旧数据
      try {
        const oldData = localStorage.getItem('wagmi.store');
        if (oldData && oldData.length > 2000000) {
          localStorage.removeItem('wagmi.store');
        }
      } catch {
        // ignore
      }

      localStorage.setItem('walletAddress', address);

      await fetchTokens(address);

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '连接钱包失败');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchTokens = async (walletAddress: string) => {
    try {
      const cached = getCachedTokens(walletAddress);
      if (cached) {
        setTokens(cached);
        return;
      }

      await initializeMoralis();
      const Moralis = getMoralis();
      const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
        chain: "0x1",
        address: walletAddress,
      });

      const tokenData = response.json.result;
      console.log('Fetched token data:', tokenData);
      setTokens(tokenData);
      setCachedTokens(walletAddress, tokenData);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(null);
    setTokens([]);
    setShouldCheckEfrog(false);
    localStorage.removeItem('walletAddress');

    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  };


  useEffect(() => {
    if (wagmiAddress) {
      const sdkConf = VeraxSdk.DEFAULT_LINEA_SEPOLIA_FRONTEND;
      const sdk = new VeraxSdk(sdkConf, wagmiAddress);
      setVeraxSdk(sdk);
    }
  }, [wagmiAddress]);


  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnecting,
        error,
        tokens,
        // efrogCount: Number(nftBalance || 0),
        // isCheckingEfrog,
        // readEfrogContractSuccess,
        connect,
        disconnect,
        getMoralis
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}; 