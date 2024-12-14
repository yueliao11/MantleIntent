import { ethers } from 'ethers';
import { MANTLE_ADVISOR_ADDRESS } from '@/lib/constants';
import MantleAdvisor from '../contract/artifacts/contracts/MantleAdvisor.sol/MantleAdvisor.json';

const FEES = {
  CONSULTATION: "0.00001 MNT",
  MIN_STAKE: "0.001 MNT"
};

export function useContract() {
  const getContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(MANTLE_ADVISOR_ADDRESS, MantleAdvisor.abi, signer);
    }
    return null;
  };

  const CONSULTATION_FEE = "0.00001";

  const purchaseConsultation = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.purchaseConsultation({
        value: ethers.utils.parseEther(CONSULTATION_FEE)
      });
      await tx.wait();
    } catch (error) {
      throw new Error(`Failed to purchase consultation: ${error.message}`);
    }
  };

  const stake = async (amount: string) => {
    try {
      const contract = await getContract();
      const tx = await contract.stake({
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
    } catch (error) {
      throw new Error(`Failed to stake ${amount} MNT: ${error.message}`);
    }
  };

  const unstake = async (amount: string) => {
    const contract = await getContract();
    const tx = await contract.unstake(ethers.utils.parseEther(amount));
    await tx.wait();
  };

  const checkAccess = async (address: string) => {
    const contract = await getContract();
    return await contract.checkAccess(address);
  };

  const getRewardPoints = async (address: string) => {
    const contract = await getContract();
    return await contract.getRewardPoints(address);
  };

  return {
    purchaseConsultation,
    stake,
    unstake, 
    checkAccess,
    getRewardPoints
  };
} 