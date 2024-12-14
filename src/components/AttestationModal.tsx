import React from 'react';
import { useAccount } from 'wagmi';
import { Hex } from 'viem';

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: Hex;
  attestationId?: Hex;
  message?: string;
}

const AttestationModal: React.FC<AttestationModalProps> = ({
  isOpen,
  onClose,
  txHash,
  attestationId,
  message,
}) => {
  const { chain } = useAccount();

  if (!isOpen) return null;

  const truncateHex = (hex: string) => {
    return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Attestation Status</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {!message && !txHash && !attestationId && (
            <p className="text-blue-600">Validating user...</p>
          )}

          {!message && txHash && !attestationId && (
            <p className="text-blue-600">Transaction pending...</p>
          )}

          {message && (
            <p className="text-red-500">{message}</p>
          )}

          {attestationId && (
            <div>
              <p className="font-medium">Attestation ID:</p>
              <a
                href={`${chain?.id === 59144 
                  ? 'https://explorer.ver.ax/linea/attestations/' 
                  : 'https://explorer.ver.ax/linea-sepolia/attestations/'}${attestationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {truncateHex(attestationId)}
              </a>
            </div>
          )}

          {txHash && (
            <div>
              <p className="font-medium">Transaction Hash:</p>
              <a
                href={`${chain?.id === 59144 
                  ? 'https://lineascan.build/tx/' 
                  : 'https://sepolia.lineascan.build/tx/'}${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {truncateHex(txHash)}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttestationModal;
