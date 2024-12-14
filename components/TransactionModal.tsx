const getFeeText = (type: string) => {
  switch(type) {
    case 'consultation':
      return '0.00001 MNT';
    case 'stake':
      return `${amount} MNT`;
    default:
      return '0 MNT';
  }
}

<div className="text-sm">
  Fee: {getFeeText(type)}
</div> 