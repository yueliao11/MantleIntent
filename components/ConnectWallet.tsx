"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/WalletContext";
import { Loader2, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LINEA_NETWORK } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nContext';
import { ThemeToggle } from "./ThemeToggle";
import { EfrogModal } from "./EfrogModal";

const WALLET_OPTIONS = [
  {
    id: "metamask",
    name: "MetaMask",
    network: {
      ...LINEA_NETWORK,
      chainId: parseInt(LINEA_NETWORK.id)
    }
  }
];

const MANTLE_NETWORK = {
  id: "0x138B",
  name: "Mantle Testnet (Sepolia)",
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  nativeCurrency: {
    name: "MNT", 
    symbol: "MNT",
    decimals: 18
  },
  blockExplorerUrls: ["https://sepolia.mantlescan.xyz"]
};

const CONSULTATION_FEE = "0.00001 MNT";

export function ConnectWallet() {
  const {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useWallet();
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const switchToMantle = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MANTLE_NETWORK.id }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MANTLE_NETWORK],
        });
      }
    }
  };

  useEffect(() => {
    if (address && window.ethereum) {
      window.ethereum.request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          if (chainId !== MANTLE_NETWORK.id) {
            promptNetworkSwitch();
          }
        });

      const handleChainChanged = (chainId: string) => {
        if (chainId !== MANTLE_NETWORK.id) {
          promptNetworkSwitch();
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address]);

  const promptNetworkSwitch = () => {
    toast({
      title: "需要切换网络",
      description: "请切换到 Mantle 测试网以继续操作",
      action: (
        <button
          onClick={switchToMantle}
          className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          切换网络
        </button>
      ),
    });
  };

  const handleConnect = async (walletId: string) => {
    try {
      if (walletId !== "metamask") {
        toast({
          title: "暂不支持",
          description: "目前仅支持 MetaMask 钱包",
          variant: "destructive",
        });
        return;
      }
      await connect();
      await switchToMantle();
    } catch (err) {
      console.error('钱包连接失败:', err);
    }
  };


  const renderConnect = () => {
    if (address) {
      return (
        <div className="flex items-center gap-2">
         {/* <ThemeToggle />*/}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={disconnect}>
                {t('wallet.disconnect')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    return <div className="relative">
      {error && <div className="absolute -top-8 right-0 text-sm text-destructive">{error}</div>}
      <DropdownMenu open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-[#3287FF] shadow-[0px_4px_25.7px_rgba(153,153,153,0.13)] rounded-[42px]" disabled={isConnecting}>
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            <span>{t('wallet.connect')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {WALLET_OPTIONS.map(wallet => (
            <DropdownMenuItem key={wallet.id} onClick={() => handleConnect(wallet.id)}>
              {wallet.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {renderConnect()}
      </div>
    </>
  );
} 