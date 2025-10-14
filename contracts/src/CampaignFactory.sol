// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CampaignFactory {
    address[] public deployedCampaigns;
    address public admin;
    
    event CampaignCreated(address campaignAddress, address creator, string title, uint goal);
    
    constructor() {
        admin = msg.sender;
    }
    
    function createCampaign(
        string memory _title,
        uint _goal,
        uint _deadline,
        string memory _category,
        string memory _description
    ) public returns (address) {
        Campaign newCampaign = new Campaign(
            msg.sender,
            _title,
            _goal,
            _deadline,
            _category,
            _description
        );
        deployedCampaigns.push(address(newCampaign));
        
        emit CampaignCreated(address(newCampaign), msg.sender, _title, _goal);
        return address(newCampaign);
    }
    
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
    
    CampaignFactory public factory;  // ✅ ADDED - Store reference to factory
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
        require(factory.isAdmin(msg.sender), "Only admin can approve");  // ✅ FIXED - Check factory admin
        _;
    }
    
    constructor(
        address _creator,
        string memory _title,
        uint _goal,
        uint _deadline,
        string memory _category,
        string memory _description
    ) {
        factory = CampaignFactory(msg.sender);  // ✅ ADDED - Save factory reference
        creator = _creator;
        title = _title;
        goal = _goal;
        deadline = block.timestamp + (_deadline * 1 days);
        category = _category;
        description = _description;
        isActive = true;
        isApproved = false;  // ✅ ADDED - Explicit initial state
    }
    
    function contribute() public payable {
        require(isActive, "Campaign not active");
        require(isApproved, "Campaign not approved yet");
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Contribution must be > 0");
        
        contributions.push(Contribution(msg.sender, msg.value, block.timestamp));
        contributionsByAddress[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit Funded(msg.sender, msg.value);
        
        if (totalRaised >= goal) {
            emit CampaignCompleted();
        }
    }
    
    function approveCampaign() public onlyAdmin {
        require(!isApproved, "Campaign already approved");  // ✅ ADDED - Prevent double approval
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