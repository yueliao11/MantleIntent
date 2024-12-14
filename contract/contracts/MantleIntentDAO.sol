// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MantleIntentDAO is Ownable {
    uint256 public constant CONSULTATION_FEE = 0.00001 ether;
    uint256 public constant PROTOCOL_REWARD_RATE = 100; // 1% = 100
    
    struct User {
        bool hasActivePlan;
        uint256 planExpiry;
        uint256 rewardPoints;
    }
    
    struct Protocol {
        address protocolAddress;
        bool isWhitelisted;
        uint256 totalVolume;
    }
    
    mapping(address => User) public users;
    mapping(address => Protocol) public protocols;
    mapping(address => uint256) public stakingBalance;
    
    uint256 public totalStaked;
    uint256 public totalRewards;
    
    event ConsultationPurchased(address indexed user, uint256 timestamp);
    event ProtocolWhitelisted(address indexed protocol);
    event ProtocolUsed(address indexed user, address indexed protocol, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    // 保持与原合约相同的接口
    function purchaseConsultation() external payable {
        require(msg.value == CONSULTATION_FEE, "Incorrect payment amount");
        
        users[msg.sender].hasActivePlan = true;
        users[msg.sender].planExpiry = block.timestamp + 30 days;
        
        emit ConsultationPurchased(msg.sender, block.timestamp);
    }
    
    // 新增:记录用户使用协议的情况
    function recordProtocolUsage(address protocol, uint256 amount) external {
        require(protocols[protocol].isWhitelisted, "Protocol not whitelisted");
        require(users[msg.sender].hasActivePlan, "No active plan");
        
        protocols[protocol].totalVolume += amount;
        users[msg.sender].rewardPoints += amount / PROTOCOL_REWARD_RATE;
        
        emit ProtocolUsed(msg.sender, protocol, amount);
    }
    
    // 新增:白名单管理
    function whitelistProtocol(address protocol) external onlyOwner {
        protocols[protocol].isWhitelisted = true;
        emit ProtocolWhitelisted(protocol);
    }
    
    // 保持原有功能
    function checkAccess(address user) external view returns (bool) {
        return users[user].hasActivePlan && users[user].planExpiry > block.timestamp;
    }
    
    // 其他原有功能保持不变...
} 