// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistry.sol";

contract CampaignFactory {
    /// @dev Longest campaign a creator can open, in days.
    uint public constant MAX_DURATION_DAYS = 365;

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
    require(_goal > 0, "Goal must be > 0");
    require(
        _deadline > 0 && _deadline <= MAX_DURATION_DAYS,
        "Deadline must be 1-365 days"
    );

    // Check if user is registered
    require(
        userRegistry.isRegistered(msg.sender),
        "You must register first before creating campaigns"
    );
    
    // Check KYC level
    require(
        userRegistry.meetsKYCRequirement(msg.sender, minKYCForCreation),
        "Insufficient KYC level to create campaign"
    );
    
    // Get user profile
    UserRegistry.UserProfile memory profile = userRegistry.getUserProfile(msg.sender);
    
    // Check user is not banned
    require(!profile.isBanned, "Your account is banned");
    
    // ✅ FIXED: Prevent BACKER role from creating campaigns
    require(
        profile.primaryRole != UserRegistry.UserRole.BACKER,
        "Backers cannot create campaigns. Please change your role to CREATOR or BOTH in your profile settings."
    );
    
    // Create campaign
    Campaign newCampaign = new Campaign(
        msg.sender,
        _title,
        _goal,
        _deadline,
        _category,
        _description,
        address(this)
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
    UserRegistry public userRegistry;
    
    address public creator;
    string public title;
    string public category;
    string public description;
    uint public goal;
    uint public deadline;
    uint public totalRaised;
    uint public totalRefunded;
    bool public fundsWithdrawn;
    bool public isApproved;
    bool public isActive;
    
    Contribution[] public contributions;
    mapping(address => uint) public contributionsByAddress;
    
    // ✅ NEW: Track unique backers
    mapping(address => bool) public hasContributed;
    uint256 public uniqueBackersCount;
    
    event Funded(address contributor, uint amount);
    event CampaignApproved();
    event CampaignCompleted();
    event FundsWithdrawn(address indexed creator, uint amount);
    event Refunded(address indexed contributor, uint amount);
    
    // Minimal reentrancy lock. OpenZeppelin's ReentrancyGuard needs solc >= 0.8.20 and this
    // project is pinned to 0.8.19, so the lock is inlined instead of changing the compiler.
    uint private _lock = 1;

    modifier nonReentrant() {
        require(_lock == 1, "Reentrant call");
        _lock = 2;
        _;
        _lock = 1;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    modifier onlyAdmin() {
        require(factory.isAdmin(msg.sender), "Only admin can approve");
        _;
    }
    
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
        userRegistry = factory.userRegistry();
        
        creator = _creator;
        title = _title;
        goal = _goal;
        deadline = block.timestamp + (_deadline * 1 days);
        category = _category;
        description = _description;
        isActive = true;
        isApproved = false;
        uniqueBackersCount = 0; // ✅ FIXED: Initialize unique backer count
    }
    
    function contribute() public payable {
        require(isActive, "Campaign not active");
        require(isApproved, "Campaign not approved yet");
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Contribution must be > 0");
        
        // ✅ FIXED: Prevent self-donation
        require(msg.sender != creator, "Cannot contribute to your own campaign");
        
        // Check if contributor is registered
        require(
            userRegistry.isRegistered(msg.sender),
            "You must register before contributing"
        );
        
        // Check KYC requirement
        require(
            userRegistry.meetsKYCRequirement(
                msg.sender, 
                factory.minKYCForContribution()
            ),
            "Insufficient KYC level to contribute"
        );
        
        // Check not banned
        UserRegistry.UserProfile memory profile = userRegistry.getUserProfile(msg.sender);
        require(!profile.isBanned, "Your account is banned");
        
        // ✅ FIXED: Track unique backers properly
        if (!hasContributed[msg.sender]) {
            hasContributed[msg.sender] = true;
            uniqueBackersCount++;
        }
        
        contributions.push(Contribution(msg.sender, msg.value, block.timestamp));
        contributionsByAddress[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit Funded(msg.sender, msg.value);
        
        if (totalRaised >= goal) {
            emit CampaignCompleted();
        }
    }
    
    function approveCampaign() public onlyAdmin {
        require(!isApproved, "Already approved");
        isApproved = true;
        emit CampaignApproved();
    }
    
    /// @notice Creator pulls the raised funds once the goal is met and the deadline has passed.
    /// @dev The flag is set before the external call (checks-effects-interactions) and the
    ///      call forwards all gas, so a contract wallet can be the creator.
    function withdrawFunds() public onlyCreator nonReentrant {
        require(!fundsWithdrawn, "Already withdrawn");
        require(totalRaised >= goal, "Goal not reached");
        require(block.timestamp >= deadline, "Campaign not ended");

        fundsWithdrawn = true;
        uint amount = totalRaised;

        (bool ok, ) = payable(creator).call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsWithdrawn(creator, amount);
    }

    /// @notice A backer pulls their own contribution back if the goal was missed.
    /// @dev Each backer withdraws for themselves, so no loop over the contributions array is needed
    ///      and one reverting backer cannot block anyone else. Banned backers can still refund.
    function refund() public nonReentrant {
        require(block.timestamp >= deadline, "Campaign not ended");
        require(totalRaised < goal, "Goal was reached");

        uint amount = contributionsByAddress[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributionsByAddress[msg.sender] = 0;
        totalRefunded += amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Refund failed");

        emit Refunded(msg.sender, amount);
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
            uniqueBackersCount, // ✅ FIXED: Return unique count
            isApproved,
            isActive,
            address(this).balance
        );
    }
    
    // ✅ FIXED: Return unique backers count
    function getContributorsCount() public view returns (uint) {
        return uniqueBackersCount;
    }
    
    // ✅ NEW: Get total number of contributions (for analytics)
    function getTotalContributions() public view returns (uint) {
        return contributions.length;
    }
}