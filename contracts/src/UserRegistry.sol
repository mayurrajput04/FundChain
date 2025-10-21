// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserRegistry
 * @dev Manages user registration, profiles, and KYC levels
 * @notice This is Phase 1 - Basic version without ZK proofs (we'll add them in Phase 2)
 */
contract UserRegistry is Ownable {
    
    // ============ ENUMS ============
    
    enum KYCLevel {
        NONE,           // 0 - Not verified
        BASIC,          // 1 - Email verified
        INTERMEDIATE,   // 2 - Identity verified (will use ZK proof later)
        ADVANCED        // 3 - Accredited investor (will use ZK proof later)
    }

    enum UserRole {
        BACKER,         // 0 - Only backs campaigns
        CREATOR,        // 1 - Only creates campaigns
        BOTH            // 2 - Can do both
    }

    // ============ STRUCTS ============
    
    struct UserProfile {
        address walletAddress;      // User's wallet address
        string username;            // Unique username
        string emailHash;           // Hashed email for privacy
        string profileImageHash;    // IPFS hash of profile image
        KYCLevel kycLevel;          // Current KYC verification level
        UserRole primaryRole;       // User's primary role
        uint256 registrationDate;   // When user registered
        uint256 lastLoginDate;      // Last activity timestamp
        bool isActive;              // Account status
        bool isBanned;              // Ban status
        uint256 reputationScore;    // 0-1000 reputation points
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => UserProfile) public users;
    mapping(string => address) public usernameToAddress;  // Prevent duplicate usernames
    mapping(address => bool) public isRegistered;
    
    address[] public allUsers;  // Array of all registered users
    
    uint256 public totalUsers;
    uint256 public totalBannedUsers;

    // ============ EVENTS ============
    
    event UserRegistered(
        address indexed userAddress,
        string username,
        UserRole role,
        uint256 timestamp
    );
    
    event ProfileUpdated(
        address indexed userAddress,
        string field
    );
    
    event KYCLevelUpdated(
        address indexed userAddress,
        KYCLevel oldLevel,
        KYCLevel newLevel
    );
    
    event UserBanned(
        address indexed userAddress,
        string reason,
        uint256 timestamp
    );
    
    event UserUnbanned(
        address indexed userAddress,
        uint256 timestamp
    );
    
    event LoginRecorded(
        address indexed userAddress,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "User not registered");
        _;
    }
    
    modifier notBanned() {
        require(!users[msg.sender].isBanned, "Account is banned");
        _;
    }
    
    modifier usernameAvailable(string memory _username) {
        require(
            usernameToAddress[_username] == address(0),
            "Username already taken"
        );
        _;
    }
    
    modifier validUsername(string memory _username) {
        bytes memory usernameBytes = bytes(_username);
        require(
            usernameBytes.length >= 3 && usernameBytes.length <= 20,
            "Username must be 3-20 characters"
        );
        
        // Check for valid characters (a-z, 0-9, underscore)
        for(uint i = 0; i < usernameBytes.length; i++) {
            bytes1 char = usernameBytes[i];
            require(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char == 0x5F),                    // underscore
                "Username can only contain lowercase letters, numbers, and underscores"
            );
        }
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        totalUsers = 0;
        totalBannedUsers = 0;
    }

    // ============ USER REGISTRATION ============
    
    /**
     * @dev Register a new user
     * @param _username Unique username (3-20 chars, lowercase, numbers, underscore)
     * @param _emailHash Keccak256 hash of user's email
     * @param _profileImageHash IPFS hash of profile image (optional, can be empty)
     * @param _primaryRole User's primary role (BACKER, CREATOR, or BOTH)
     */
    function registerUser(
        string memory _username,
        string memory _emailHash,
        string memory _profileImageHash,
        UserRole _primaryRole
    ) 
        external 
        validUsername(_username)
        usernameAvailable(_username)
    {
        require(!isRegistered[msg.sender], "Already registered");
        
        // Create user profile
        users[msg.sender] = UserProfile({
            walletAddress: msg.sender,
            username: _username,
            emailHash: _emailHash,
            profileImageHash: _profileImageHash,
            kycLevel: KYCLevel.NONE,
            primaryRole: _primaryRole,
            registrationDate: block.timestamp,
            lastLoginDate: block.timestamp,
            isActive: true,
            isBanned: false,
            reputationScore: 100  // Everyone starts with 100 reputation
        });
        
        // Update mappings
        isRegistered[msg.sender] = true;
        usernameToAddress[_username] = msg.sender;
        allUsers.push(msg.sender);
        totalUsers++;
        
        emit UserRegistered(msg.sender, _username, _primaryRole, block.timestamp);
    }

    // ============ PROFILE MANAGEMENT ============
    
    /**
     * @dev Update user's email hash
     */
    function updateEmail(string memory _newEmailHash) external onlyRegistered notBanned {
        users[msg.sender].emailHash = _newEmailHash;
        emit ProfileUpdated(msg.sender, "email");
    }
    
    /**
     * @dev Update user's profile image
     */
    function updateProfileImage(string memory _newImageHash) external onlyRegistered notBanned {
        users[msg.sender].profileImageHash = _newImageHash;
        emit ProfileUpdated(msg.sender, "profileImage");
    }
    
    /**
     * @dev Update user's primary role
     */
    function updateRole(UserRole _newRole) external onlyRegistered notBanned {
        users[msg.sender].primaryRole = _newRole;
        emit ProfileUpdated(msg.sender, "role");
    }
    
    /**
     * @dev Record user login (update last login timestamp)
     */
    function recordLogin() external onlyRegistered notBanned {
        users[msg.sender].lastLoginDate = block.timestamp;
        emit LoginRecorded(msg.sender, block.timestamp);
    }

    // ============ KYC MANAGEMENT ============
    
    /**
     * @dev Manually set KYC level (Admin only - for testing)
     * @notice In production, this will be replaced with ZK proof verification
     */
    function setKYCLevel(address _user, KYCLevel _newLevel) external onlyOwner {
        require(isRegistered[_user], "User not registered");
        
        KYCLevel oldLevel = users[_user].kycLevel;
        users[_user].kycLevel = _newLevel;
        
        emit KYCLevelUpdated(_user, oldLevel, _newLevel);
    }
    
    /**
     * @dev Check if user meets minimum KYC requirement
     */
    function meetsKYCRequirement(
        address _user, 
        KYCLevel _requiredLevel
    ) 
        external 
        view 
        returns (bool) 
    {
        if (!isRegistered[_user]) return false;
        if (users[_user].isBanned) return false;
        return users[_user].kycLevel >= _requiredLevel;
    }

    // ============ REPUTATION SYSTEM ============
    
    /**
     * @dev Increase user's reputation (called by other contracts)
     */
    function increaseReputation(address _user, uint256 _amount) external onlyOwner {
        require(isRegistered[_user], "User not registered");
        
        uint256 newScore = users[_user].reputationScore + _amount;
        if (newScore > 1000) newScore = 1000;  // Cap at 1000
        
        users[_user].reputationScore = newScore;
    }
    
    /**
     * @dev Decrease user's reputation (called by other contracts)
     */
    function decreaseReputation(address _user, uint256 _amount) external onlyOwner {
        require(isRegistered[_user], "User not registered");
        
        if (users[_user].reputationScore < _amount) {
            users[_user].reputationScore = 0;
        } else {
            users[_user].reputationScore -= _amount;
        }
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Ban a user
     */
    function banUser(address _user, string memory _reason) external onlyOwner {
        require(isRegistered[_user], "User not registered");
        require(!users[_user].isBanned, "Already banned");
        
        users[_user].isBanned = true;
        totalBannedUsers++;
        
        emit UserBanned(_user, _reason, block.timestamp);
    }
    
    /**
     * @dev Unban a user
     */
    function unbanUser(address _user) external onlyOwner {
        require(isRegistered[_user], "User not registered");
        require(users[_user].isBanned, "Not banned");
        
        users[_user].isBanned = false;
        totalBannedUsers--;
        
        emit UserUnbanned(_user, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user profile
     */
    function getUserProfile(address _user) 
        external 
        view 
        returns (UserProfile memory) 
    {
        require(isRegistered[_user], "User not registered");
        return users[_user];
    }
    
    /**
     * @dev Get user's KYC level
     */
    function getUserKYCLevel(address _user) external view returns (KYCLevel) {
        require(isRegistered[_user], "User not registered");
        return users[_user].kycLevel;
    }
    
    /**
     * @dev Check if username is available
     */
    function isUsernameAvailable(string memory _username) 
        external 
        view 
        returns (bool) 
    {
        return usernameToAddress[_username] == address(0);
    }
    
    /**
     * @dev Get all registered users (paginated)
     */
    function getUsers(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory) 
    {
        require(_offset < allUsers.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > allUsers.length) {
            end = allUsers.length;
        }
        
        address[] memory result = new address[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allUsers[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get total number of users
     */
    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }
    
    /**
     * @dev Get platform statistics
     */
    function getStats() external view returns (
        uint256 total,
        uint256 banned,
        uint256 active
    ) {
        return (
            totalUsers,
            totalBannedUsers,
            totalUsers - totalBannedUsers
        );
    }
}