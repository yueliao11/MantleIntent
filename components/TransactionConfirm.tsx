export function TransactionConfirm({ type, amount }) {
  const getFeeText = () => {
    switch(type) {
      case 'consultation':
        return '0.00001 MNT';
      case 'stake':
        return `${amount} MNT`;
      case 'unstake':
        return `${amount} MNT`;
      default:
        return '0 MNT';
    }
  };

  return (
    <div>
      <p>确认支付 {getFeeText()}</p>
      {/* ... */}
    </div>
  );
} 