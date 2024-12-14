export const CONTRACTS = {
  
  MantleAdvisor: {
    address: "0x01BF44a3fd371597AF77B3fE1c9a36f54547866E",
    abi: [
      "function purchaseConsultation() external payable",
      "function checkAccess(address user) external view returns (bool)",
      "function stake() external payable",
      "function unstake(uint256 amount) external",
      "event ConsultationPurchased(address indexed user, uint256 timestamp)",
      "event Staked(address indexed user, uint256 amount)",
      "event Unstaked(address indexed user, uint256 amount)"
    ]
  },
  MantleIntentDAO: {
    address: "", // 待部署
    abi: [
      "function whitelistProtocol(address protocol) external",
      "function isWhitelisted(address protocol) external view returns (bool)",
      "function owner() external view returns (address)"
    ]
  }
}; 

// 导出单独的常量供前端使用
export const ADVISOR_ADDRESS = CONTRACTS.MantleAdvisor.address;
export const ADVISOR_ABI = CONTRACTS.MantleAdvisor.abi; 