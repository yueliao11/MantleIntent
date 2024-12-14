import { VeraxSdk } from '@verax-attestation-registry/verax-sdk';
import { useReadContract } from 'wagmi';

const TESTNET_EFROGS_CONTRACT = '0x35c134262605bc69B3383EA132A077d09d8df061';
const PORTAL_ADDRESS = '0x0Cb56F201E7aFe02E542E2D2D42c34d4ce7203F7';

export class VeraxService {
  private sdk: VeraxSdk | null = null;

  async checkEfrogBalance(address: string) {
    try {
      const { data: balance } = await useReadContract({
        abi: [
          {
            type: 'function',
            name: 'balanceOf',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        address: TESTNET_EFROGS_CONTRACT,
        args: [address],
      });

      return Number(balance || 0);
    } catch (error) {
      console.error('Failed to check eFrog balance:', error);
      return 0;
    }
  }

  async initialize(address: string) {
    if (typeof window === 'undefined') return;
    
    const sdkConf = VeraxSdk.DEFAULT_LINEA_SEPOLIA_FRONTEND;
    this.sdk = new VeraxSdk(sdkConf, address);
  }

  async verifyAttestation(address: string, balance: number) {
    if (!this.sdk) {
      await this.initialize(address);
    }

    try {
      if (!this.sdk) throw new Error('SDK not initialized');

      const attestation = await this.sdk.portal.attest(
        PORTAL_ADDRESS,
        {
          schemaId: '0x5dc8bc9158dd69ee8a234bb8f9ab1f4f17bb52c84b6fd4720d58ec82bb43d2f5',
          expirationDate: Math.floor(Date.now() / 1000) + 2592000,
          subject: address,
          attestationData: [{
            contract: TESTNET_EFROGS_CONTRACT,
            balance: balance.toString()
          }]
        }
      );

      return attestation;
    } catch (error) {
      console.error('Failed to verify attestation:', error);
      return null;
    }
  }
}