import React, { useCallback, useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { VeraxSdk } from '@verax-attestation-registry/verax-sdk';
import { waitForTransactionReceipt } from 'viem/actions';
import { Hex } from 'viem';
import AttestationButton from '../components/AttestationButton';
import AttestationModal from '../components/AttestationModal';
import {
  EFROGS_CONTRACT,
  PORTAL_ADDRESS,
  TESTNET_EFROGS_CONTRACT,
  TESTNET_PORTAL_ADDRESS,
  TRANSACTION_VALUE,
} from '../constants/contracts';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export default function Attestation() {
  const [veraxSdk, setVeraxSdk] = useState<VeraxSdk>();
  const [txHash, setTxHash] = useState<Hex>();
  const [attestationId, setAttestationId] = useState<Hex>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>();

  const { address, chain, isConnected } = useAccount();

  // Initialize Verax SDK
  useEffect(() => {
    if (chain?.id && address) {
      const sdkConf = chain.id === 59144
        ? VeraxSdk.DEFAULT_LINEA_MAINNET_FRONTEND
        : VeraxSdk.DEFAULT_LINEA_SEPOLIA_FRONTEND;
      const sdk = new VeraxSdk(sdkConf, address);
      setVeraxSdk(sdk);
    }
  }, [chain?.id, address]);

  // Check eFrogs balance
  const { data: balance } = useReadContract({
    address: chain?.testnet ? TESTNET_EFROGS_CONTRACT : EFROGS_CONTRACT,
    abi: [{
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    }],
    functionName: 'balanceOf',
    args: [address ?? '0x0'],
    enabled: !!address,
  });

  const issueAttestation = useCallback(async () => {
    if (!address || !veraxSdk || !balance) return;

    setTxHash(undefined);
    setAttestationId(undefined);
    setMessage(undefined);
    setIsModalOpen(true);

    try {
      let receipt = await veraxSdk.portal.attest(
        chain?.testnet ? TESTNET_PORTAL_ADDRESS : PORTAL_ADDRESS,
        {
          schemaId: '0x5dc8bc9158dd69ee8a234bb8f9ab1f4f17bb52c84b6fd4720d58ec82bb43d2f5',
          expirationDate: Math.floor(Date.now() / 1000) + 2592000, // 30 days
          subject: address,
          attestationData: [{
            contract: chain?.testnet ? TESTNET_EFROGS_CONTRACT : EFROGS_CONTRACT,
            balance,
          }],
        },
        [],
        false,
        TRANSACTION_VALUE
      );

      if (receipt.transactionHash) {
        setTxHash(receipt.transactionHash);
        receipt = await waitForTransactionReceipt(window.ethereum, {
          hash: receipt.transactionHash,
        });
        setAttestationId(receipt.logs?.[0].topics[1] as Hex);
      } else {
        setMessage(DEFAULT_ERROR_MESSAGE);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setMessage(e.message.includes('User rejected')
          ? 'Transaction was rejected'
          : `${DEFAULT_ERROR_MESSAGE} - ${e.message}`);
      } else {
        setMessage(DEFAULT_ERROR_MESSAGE);
      }
    }
  }, [address, veraxSdk, balance, chain?.testnet]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          eFrogs NFT Attestation
        </h2>
        
        {isConnected && (
          <div className="text-center mb-6">
            {balance !== undefined && (
              <p className="text-lg">
                You have {balance.toString()} eFrog{balance === 1n ? '' : 's'}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <AttestationButton
            disabled={!address || !veraxSdk || !balance}
            onClick={issueAttestation}
            balance={balance}
          />
        </div>

        <AttestationModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          txHash={txHash}
          attestationId={attestationId}
          message={message}
        />
      </div>
    </div>
  );
}
