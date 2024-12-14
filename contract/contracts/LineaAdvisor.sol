// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LineaAdvisor is Ownable {
    uint256 public constant CONSULTATION_FEE = 0.00001 ether; // 0.00001 ETH
    
    struct User {
        bool hasActivePlan;
        uint256 planExpiry;
    }
    
    mapping(address => User) public users;
    mapping(address => uint256) public stakingBalance;
    uint256 public totalStaked;
    
    event ConsultationPurchased(address indexed user, uint256 timestamp);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function purchaseConsultation() external payable {
        require(msg.value == CONSULTATION_FEE, "Incorrect payment amount");
                
        users[msg.sender].hasActivePlan = true;
        users[msg.sender].planExpiry = block.timestamp + 30 days;
        
        emit ConsultationPurchased(msg.sender, block.timestamp);
    }
    
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
    
    function checkAccess(address user) external view returns (bool) {
        return users[user].hasActivePlan && users[user].planExpiry > block.timestamp;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
} 