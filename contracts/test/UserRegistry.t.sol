// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/UserRegistry.sol";

contract UserRegistryTest is Test {
    UserRegistry public registry;
    
    address public admin;
    address public user1;
    address public user2;
    
    // Setup runs before each test
    function setUp() public {
        admin = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        registry = new UserRegistry();
    }
    
    // Test 1: User registration
    function testUserRegistration() public {
        vm.prank(user1);  // Call as user1
        
        registry.registerUser(
            "alice",
            "email_hash_123",
            "",
            UserRegistry.UserRole.BACKER
        );
        
        // Check registration
        assertTrue(registry.isRegistered(user1));
        
        // Check profile
        UserRegistry.UserProfile memory profile = registry.getUserProfile(user1);
        assertEq(profile.username, "alice");
        assertEq(uint(profile.primaryRole), uint(UserRegistry.UserRole.BACKER));
        assertEq(profile.reputationScore, 100);
    }
    
    // Test 2: Duplicate username should fail
    function testDuplicateUsername() public {
        vm.prank(user1);
        registry.registerUser("alice", "hash1", "", UserRegistry.UserRole.BACKER);
        
        vm.prank(user2);
        vm.expectRevert("Username already taken");
        registry.registerUser("alice", "hash2", "", UserRegistry.UserRole.CREATOR);
    }
    
    // Test 3: Invalid username should fail
    function testInvalidUsername() public {
        vm.prank(user1);
        
        // Too short
        vm.expectRevert("Username must be 3-20 characters");
        registry.registerUser("ab", "hash", "", UserRegistry.UserRole.BACKER);
        
        // Too long
        vm.prank(user1);
        vm.expectRevert("Username must be 3-20 characters");
        registry.registerUser("this_username_is_way_too_long", "hash", "", UserRegistry.UserRole.BACKER);
        
        // Invalid characters (uppercase)
        vm.prank(user1);
        vm.expectRevert("Username can only contain lowercase letters, numbers, and underscores");
        registry.registerUser("Alice", "hash", "", UserRegistry.UserRole.BACKER);
    }
    
    // Test 4: KYC level update (admin only)
    function testKYCUpdate() public {
        // Register user first
        vm.prank(user1);
        registry.registerUser("alice", "hash", "", UserRegistry.UserRole.CREATOR);
        
        // Admin sets KYC level
        registry.setKYCLevel(user1, UserRegistry.KYCLevel.BASIC);
        
        // Check level
        UserRegistry.KYCLevel level = registry.getUserKYCLevel(user1);
        assertEq(uint(level), uint(UserRegistry.KYCLevel.BASIC));
    }
    
    // Test 5: KYC requirement check
    function testKYCRequirement() public {
        vm.prank(user1);
        registry.registerUser("alice", "hash", "", UserRegistry.UserRole.CREATOR);
        
        // Should not meet BASIC requirement
        assertFalse(registry.meetsKYCRequirement(user1, UserRegistry.KYCLevel.BASIC));
        
        // Set to BASIC
        registry.setKYCLevel(user1, UserRegistry.KYCLevel.BASIC);
        
        // Should now meet BASIC requirement
        assertTrue(registry.meetsKYCRequirement(user1, UserRegistry.KYCLevel.BASIC));
        
        // Should NOT meet INTERMEDIATE requirement
        assertFalse(registry.meetsKYCRequirement(user1, UserRegistry.KYCLevel.INTERMEDIATE));
    }
    
    // Test 6: Ban/Unban user
    function testBanUser() public {
        vm.prank(user1);
        registry.registerUser("alice", "hash", "", UserRegistry.UserRole.BACKER);
        
        // Ban user
        registry.banUser(user1, "Spam");
        
        // Check ban status
        UserRegistry.UserProfile memory profile = registry.getUserProfile(user1);
        assertTrue(profile.isBanned);
        
        // Banned user should not meet KYC requirement
        registry.setKYCLevel(user1, UserRegistry.KYCLevel.BASIC);
        assertFalse(registry.meetsKYCRequirement(user1, UserRegistry.KYCLevel.BASIC));
        
        // Unban
        registry.unbanUser(user1);
        profile = registry.getUserProfile(user1);
        assertFalse(profile.isBanned);
    }
    
    // Test 7: Reputation system
    function testReputation() public {
        vm.prank(user1);
        registry.registerUser("alice", "hash", "", UserRegistry.UserRole.CREATOR);
        
        // Increase reputation
        registry.increaseReputation(user1, 50);
        UserRegistry.UserProfile memory profile = registry.getUserProfile(user1);
        assertEq(profile.reputationScore, 150);
        
        // Decrease reputation
        registry.decreaseReputation(user1, 30);
        profile = registry.getUserProfile(user1);
        assertEq(profile.reputationScore, 120);
        
        // Cap at 1000
        registry.increaseReputation(user1, 1000);
        profile = registry.getUserProfile(user1);
        assertEq(profile.reputationScore, 1000);
    }
    
    // Test 8: Profile updates
    function testProfileUpdate() public {
        vm.prank(user1);
        registry.registerUser("alice", "hash1", "", UserRegistry.UserRole.BACKER);
        
        // Update email
        vm.prank(user1);
        registry.updateEmail("new_hash");
        UserRegistry.UserProfile memory profile = registry.getUserProfile(user1);
        assertEq(profile.emailHash, "new_hash");
        
        // Update role
        vm.prank(user1);
        registry.updateRole(UserRegistry.UserRole.CREATOR);
        profile = registry.getUserProfile(user1);
        assertEq(uint(profile.primaryRole), uint(UserRegistry.UserRole.CREATOR));
    }
    
    // Test 9: Get stats
    function testGetStats() public {
        // Register 3 users
        vm.prank(user1);
        registry.registerUser("alice", "hash1", "", UserRegistry.UserRole.BACKER);
        
        vm.prank(user2);
        registry.registerUser("bob", "hash2", "", UserRegistry.UserRole.CREATOR);
        
        vm.prank(address(0x3));
        registry.registerUser("charlie", "hash3", "", UserRegistry.UserRole.BOTH);
        
        // Ban one user
        registry.banUser(user1, "Test");
        
        // Check stats
        (uint256 total, uint256 banned, uint256 active) = registry.getStats();
        assertEq(total, 3);
        assertEq(banned, 1);
        assertEq(active, 2);
    }
}