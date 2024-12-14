"use client";

import { useState } from 'react';
import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { waitForTransaction } from '@wagmi/core';
import { CONTRACTS } from '@/config/contracts';
import { parseEther } from 'viem';
import { useToast } from '@/hooks/use-toast';

export function useAdvisorContract() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { data: accessData, refetch: refetchAccess } = useContractRead({
    address: CONTRACTS.LineaAdvisor.address as `0x${string}`,
    abi: CONTRACTS.LineaAdvisor.abi,
    functionName: 'checkAccess',
    args: [address],
    enabled: !!address,
  });

  const checkAccess = async () => {
    if (!address) return false;
    const result = await refetchAccess();
    return Boolean(result.data);
  };

  const { writeAsync: purchase } = useContractWrite({
    address: CONTRACTS.LineaAdvisor.address as `0x${string}`,
    abi: CONTRACTS.LineaAdvisor.abi,
    functionName: 'purchaseConsultation',
  });

  const unlockAdvisor = async () => {
    if (!address) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUnlocking(true);
      const fee = parseEther('0.00001');

      const purchaseTx = await purchase({
        value: fee,
      });
      
      await waitForTransaction({ hash: purchaseTx.hash });

      setIsUnlocking(false);
      toast({
        title: "解锁成功",
        description: "您现在可以开始使用AI顾问服务了",
      });
      await refetchAccess();
    } catch (error) {
      console.error('Unlock failed:', error);
      setIsUnlocking(false);
      toast({
        title: "解锁失败", 
        description: "请确保您有足够的ETH支付解锁费用",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    unlockAdvisor,
    isUnlocking,
    checkAccess,
  };
} 