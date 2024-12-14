export const LINEA_NETWORK = {
  chainId: '0xe705',
  chainName: 'Linea Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  blockExplorerUrls: ['https://sepolia.lineascan.build']
}; 

export const TRANSACTION_VALUE = BigInt('100000000000000'); // 0.0001 ETH in wei 


export const TESTNET_EFROGS_CONTRACT =
  '0x35c134262605bc69B3383EA132A077d09d8df061';
export const EFROGS_CONTRACT = '0x194395587d7b169e63eaf251e86b1892fa8f1960';
export const TESTNET_PORTAL_ADDRESS =
  '0x0Cb56F201E7aFe02E542E2D2D42c34d4ce7203F7';
export const PORTAL_ADDRESS = '0x0Cb56F201E7aFe02E542E2D2D42c34d4ce7203F7';

export const MANTLE_NETWORK = {
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

export const MANTLE_ADVISOR_ADDRESS = "0x01BF44a3fd371597AF77B3fE1c9a36f54547866E";
