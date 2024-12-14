// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MantleAdvisor is Ownable {
    uint256 public constant CONSULTATION_FEE = 0.00001 ether;
    uint256 public constant BASE_REWARD_POINTS = 10; // 新增:基础积分奖励
    
    struct User {
        bool hasActivePlan;
        uint256 planExpiry;
        uint256 rewardPoints;    // 新增:用户积分
    }
    
    struct Protocol {
        address protocolAddress;
        bool isWhitelisted;
        uint256 usageCount;
        string url;
    }
    
    mapping(address => User) public users;
    mapping(address => Protocol) public protocols;
    mapping(address => uint256) public stakingBalance;  // 保持原有质押功能
    
    uint256 public totalStaked;
    
    // 保持原有事件
    event ConsultationPurchased(address indexed user, uint256 timestamp);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    
    // 新增事件
    event ProtocolWhitelisted(address indexed protocol, string url);
    event ProtocolUsed(address indexed user, address indexed protocol);
    
    constructor() Ownable(msg.sender) {}
    
    // 保持原有功能不变
    function purchaseConsultation() external payable {
        require(msg.value == CONSULTATION_FEE, "Incorrect payment amount");
        
        users[msg.sender].hasActivePlan = true;
        users[msg.sender].planExpiry = block.timestamp + 30 days;
        
        emit ConsultationPurchased(msg.sender, block.timestamp);
    }
    
    // 保持原有质押功能
    function stake() external payable {
        require(msg.value > 0, "Cannot stake 0");
        
        stakingBalance[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    function unstake(uint256 amount) external {
        require(stakingBalance[msg.sender] >= amount, "Insufficient balance");
        
        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    // 保持原有访问检查
    function checkAccess(address user) external view returns (bool) {
        return users[user].hasActivePlan && users[user].planExpiry > block.timestamp;
    }
    
    // 新增:记录协议使用
    function recordProtocolUsage(address protocol) external {
        require(protocols[protocol].isWhitelisted, "Protocol not whitelisted");
        require(users[msg.sender].hasActivePlan, "No active plan");
        require(users[msg.sender].planExpiry > block.timestamp, "Plan expired");
        
        protocols[protocol].usageCount += 1;
        users[msg.sender].rewardPoints += BASE_REWARD_POINTS;
        
        emit ProtocolUsed(msg.sender, protocol);
    }
    
    // 新增:白名单管理
    function whitelistProtocol(address protocol, string calldata url) external onlyOwner {
        protocols[protocol].protocolAddress = protocol;
        protocols[protocol].isWhitelisted = true;
        protocols[protocol].url = url;
        
        emit ProtocolWhitelisted(protocol, url);
    }
    
    // 新增:查询功能
    function getProtocolUrl(address protocol) external view returns (string memory) {
        require(protocols[protocol].isWhitelisted, "Protocol not whitelisted");
        return protocols[protocol].url;
    }
    
    function getRewardPoints(address user) external view returns (uint256) {
        return users[user].rewardPoints;
    }
    
    function getProtocolUsageCount(address protocol) external view returns (uint256) {
        return protocols[protocol].usageCount;
    }
    
    // 保持原有提现功能
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
} 