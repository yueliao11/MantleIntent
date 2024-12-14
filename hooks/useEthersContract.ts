"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/config/contracts';
import { useToast } from '@/hooks/use-toast';
import { AIA_NETWORK } from '@/lib/constants';

export function useEthersContract() {
  const [address, setAddress] = useState<string | null>(null);
  const [unlockingAdvisor, setUnlockingAdvisor] = useState<string | null>(null);
  const [unlockedAdvisors, setUnlockedAdvisors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAddress(accounts[0] || null);

          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            setAddress(newAccounts[0] || null);
          });
        } catch (error) {
          console.error('Failed to get accounts:', error);
        }
      }
    }

    init();

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const checkAccess = async (advisorType: string) => {
    if (!address || !window.ethereum) return false;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        "0x4b2f2583B3730820D0A8F2076e3a90Af26872B99",
        [
          "function purchaseConsultation() external payable",
          "function checkAccess(address user) external view returns (bool)",
          "function stake() external payable",
          "function unstake(uint256 amount) external"
        ],
        provider
      );
      
      const hasAccess = await contract.checkAccess(address);
      if (hasAccess) {
        setUnlockedAdvisors(prev => [...new Set([...prev, advisorType])]);
      }
      return hasAccess;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  const unlockAdvisor = async (advisorType: string) => {
    if (!address) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(`需要花费 0.00001 MNT 来解锁${advisorType}，是否继续？`);
    if (!confirmed) return;

    try {
      setUnlockingAdvisor(advisorType);
      const fee = ethers.parseEther('0.00001');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        "0x4b2f2583B3730820D0A8F2076e3a90Af26872B99",
        [
          "function purchaseConsultation() external payable",
          "function checkAccess(address user) external view returns (bool)",
          "function stake() external payable",
          "function unstake(uint256 amount) external"
        ],
        signer
      );

      console.log('Purchasing consultation...');
      const purchaseTx = await contract.purchaseConsultation({ value: fee });
      
      console.log('Waiting for transaction...');
      const receipt = await purchaseTx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 0) {
        throw new Error("交易执行失败");
      }

      setUnlockedAdvisors(prev => [...new Set([...prev, advisorType])]);
      
      setUnlockingAdvisor(null);
      toast({
        title: "解锁成功",
        description: `${advisorType}已解锁，您现在可以开始使用顾问服务了`,
      });
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockingAdvisor(null);
      toast({
        title: "解锁失败",
        description: error.message || "请确保您有足够的MNT并已授权支付",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    address,
    unlockAdvisor,
    unlockingAdvisor,
    checkAccess,
    unlockedAdvisors,
  };
} 