import React from 'react';
import { useAccount } from 'wagmi';

interface AttestationButtonProps {
  disabled?: boolean;
  onClick: () => void;
  balance?: bigint;
}

const AttestationButton: React.FC<AttestationButtonProps> = ({
  disabled,
  onClick,
  balance,
}) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
    >
      {balance !== undefined
        ? `Issue Attestation (${balance.toString()} eFrogs)`
        : 'Issue Attestation'}
    </button>
  );
};

export default AttestationButton;
