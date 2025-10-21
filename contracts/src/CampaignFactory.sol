// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistry.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;
    address public admin;
    UserRegistry public userRegistry;  // ✅ NEW: Reference to UserRegistry
    
    // ✅ NEW: Minimum KYC requirements
    UserRegistry.KYCLevel public minKYCForCreation;
    UserRegistry.KYCLevel public minKYCForContribution;
    
    event CampaignCreated(
        address campaignAddress, 
        address creator, 
        string title, 
        uint goal
    );
    
    // ✅ UPDATED: Constructor now takes UserRegistry address
    constructor(address _userRegistryAddress) {
        admin = msg.sender;
        userRegistry = UserRegistry(_userRegistryAddress);
        
        // Set default KYC requirements
        minKYCForCreation = UserRegistry.KYCLevel.BASIC;      // Need BASIC to create
        minKYCForContribution = UserRegistry.KYCLevel.NONE;   // Anyone can contribute
    }
    
    function createCampaign(
        string memory _title,
        uint _goal,
        uint _deadline,
        string memory _category,
        string memory _description
    ) public returns (address) {
        // ✅ NEW: Check if user is registered
        require(
            userRegistry.isRegistered(msg.sender),
            "You must register first before creating campaigns"
        );
        
        // ✅ NEW: Check KYC level
        require(
            userRegistry.meetsKYCRequirement(msg.sender, minKYCForCreation),
            "Insufficient KYC level to create campaign"
        );
        
        // ✅ NEW: Check user is not banned
        UserRegistry.UserProfile memory profile = userRegistry.getUserProfile(msg.sender);
        require(!profile.isBanned, "Your account is banned");
        
        // Rest of campaign creation (existing code)
        Campaign newCampaign = new Campaign(
            msg.sender,
            _title,
            _goal,
            _deadline,
            _category,
            _description,
            address(this)  // Pass factory address
        );
        
        deployedCampaigns.push(address(newCampaign));
        
        emit CampaignCreated(address(newCampaign), msg.sender, _title, _goal);
        return address(newCampaign);
    }
    
    // ✅ NEW: Admin can change KYC requirements
    function setMinKYCForCreation(UserRegistry.KYCLevel _level) external {
        require(msg.sender == admin, "Only admin");
        minKYCForCreation = _level;
    }
    
    function setMinKYCForContribution(UserRegistry.KYCLevel _level) external {
        require(msg.sender == admin, "Only admin");
        minKYCForContribution = _level;
    }
    
    // Existing functions remain the same
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
    
    function isAdmin(address _address) public view returns (bool) {
        return _address == admin;
    }
}

contract Campaign {
    struct Contribution {
        address contributor;
        uint amount;
        uint timestamp;
    }
    
    CampaignFactory public factory;
    UserRegistry public userRegistry;  // ✅ NEW
    
    address public creator;
    string public title;
    string public category;
    string public description;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    bool public isApproved;
    bool public isActive;
    
    Contribution[] public contributions;
    mapping(address => uint) public contributionsByAddress;
    
    event Funded(address contributor, uint amount);
    event CampaignApproved();
    event CampaignCompleted();
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    modifier onlyAdmin() {
        require(factory.isAdmin(msg.sender), "Only admin can approve");
        _;
    }
    
    // ✅ UPDATED: Constructor
    constructor(
        address _creator,
        string memory _title,
        uint _goal,
        uint _deadline,
        string memory _category,
        string memory _description,
        address _factoryAddress
    ) {
        factory = CampaignFactory(_factoryAddress);
        userRegistry = factory.userRegistry();  // ✅ Get UserRegistry from factory
        
        creator = _creator;
        title = _title;
        goal = _goal;
        deadline = block.timestamp + (_deadline * 1 days);
        category = _category;
        description = _description;
        isActive = true;
        isApproved = false;
    }
    
    function contribute() public payable {
        require(isActive, "Campaign not active");
        require(isApproved, "Campaign not approved yet");
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Contribution must be > 0");
        
        // ✅ NEW: Check if contributor is registered
        require(
            userRegistry.isRegistered(msg.sender),
            "You must register before contributing"
        );
        
        // ✅ NEW: Check KYC requirement
        require(
            userRegistry.meetsKYCRequirement(
                msg.sender, 
                factory.minKYCForContribution()
            ),
            "Insufficient KYC level to contribute"
        );
        
        // ✅ NEW: Check not banned
        UserRegistry.UserProfile memory profile = userRegistry.getUserProfile(msg.sender);
        require(!profile.isBanned, "Your account is banned");
        
        contributions.push(Contribution(msg.sender, msg.value, block.timestamp));
        contributionsByAddress[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit Funded(msg.sender, msg.value);
        
        if (totalRaised >= goal) {
            emit CampaignCompleted();
        }
    }
    
    function approveCampaign() public onlyAdmin {
        isApproved = true;
        emit CampaignApproved();
    }
    
    function withdrawFunds() public onlyCreator {
        require(totalRaised >= goal, "Goal not reached");
        require(block.timestamp >= deadline, "Campaign not ended");
        
        payable(creator).transfer(address(this).balance);
    }
    
    function getCampaignDetails() public view returns (
        address, string memory, string memory, string memory, 
        uint, uint, uint, uint, bool, bool, uint
    ) {
        return (
            creator,
            title,
            category,
            description,
            goal,
            deadline,
            totalRaised,
            contributions.length,
            isApproved,
            isActive,
            address(this).balance
        );
    }
    
    function getContributorsCount() public view returns (uint) {
        return contributions.length;
    }
}