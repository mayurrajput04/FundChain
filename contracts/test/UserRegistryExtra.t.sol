// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/UserRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Covers the registry paths the original test file does not touch.
contract UserRegistryExtraTest is Test {
    UserRegistry registry;
    address alice = address(0xA1);
    address bob = address(0xB0);
    address carol = address(0xCA);

    function setUp() public {
        registry = new UserRegistry();
    }

    function _reg(address who, string memory name) internal {
        vm.prank(who);
        registry.registerUser(name, "h", "img", UserRegistry.UserRole.BOTH);
    }

    function test_RegisterTwiceFromSameWalletReverts() public {
        _reg(alice, "alice");
        vm.prank(alice);
        vm.expectRevert("Already registered");
        registry.registerUser("alice2", "h", "", UserRegistry.UserRole.BACKER);
    }

    function test_UsernameValidation() public {
        vm.startPrank(alice);
        vm.expectRevert("Username must be 3-20 characters");
        registry.registerUser("abcdefghijklmnopqrstu", "h", "", UserRegistry.UserRole.BACKER); // 21
        vm.expectRevert("Username can only contain lowercase letters, numbers, and underscores");
        registry.registerUser("Alice", "h", "", UserRegistry.UserRole.BACKER);
        vm.expectRevert("Username can only contain lowercase letters, numbers, and underscores");
        registry.registerUser("al ice", "h", "", UserRegistry.UserRole.BACKER);
        vm.expectRevert("Username can only contain lowercase letters, numbers, and underscores");
        registry.registerUser("alice!", "h", "", UserRegistry.UserRole.BACKER);
        // edges that are allowed: 3 chars, 20 chars, digits and underscore
        registry.registerUser("a_1", "h", "", UserRegistry.UserRole.BACKER);
        vm.stopPrank();
        vm.prank(bob);
        registry.registerUser("abcdefghijklmnopqrst", "h", "", UserRegistry.UserRole.BACKER); // 20
        assertEq(registry.totalUsers(), 2);
    }

    function test_RegistrationRecordsEverything() public {
        vm.warp(1_000_000);
        _reg(alice, "alice");
        UserRegistry.UserProfile memory p = registry.getUserProfile(alice);
        assertEq(p.walletAddress, alice);
        assertEq(p.emailHash, "h");
        assertEq(p.profileImageHash, "img");
        assertEq(uint(p.kycLevel), uint(UserRegistry.KYCLevel.NONE));
        assertEq(p.registrationDate, 1_000_000);
        assertEq(p.lastLoginDate, 1_000_000);
        assertTrue(p.isActive);
        assertFalse(p.isBanned);
        assertEq(registry.usernameToAddress("alice"), alice);
        assertFalse(registry.isUsernameAvailable("alice"));
        assertTrue(registry.isUsernameAvailable("nobody"));
        assertEq(registry.allUsers(0), alice);
        assertEq(registry.getTotalUsers(), 1);
    }

    function test_ProfileUpdatesNeedRegistration() public {
        vm.startPrank(carol);
        vm.expectRevert("User not registered");
        registry.updateEmail("x");
        vm.expectRevert("User not registered");
        registry.updateProfileImage("x");
        vm.expectRevert("User not registered");
        registry.updateRole(UserRegistry.UserRole.CREATOR);
        vm.expectRevert("User not registered");
        registry.recordLogin();
        vm.stopPrank();
    }

    function test_BannedUserCannotUpdateProfile() public {
        _reg(alice, "alice");
        registry.banUser(alice, "spam");
        vm.startPrank(alice);
        vm.expectRevert("Account is banned");
        registry.updateEmail("x");
        vm.expectRevert("Account is banned");
        registry.updateProfileImage("x");
        vm.expectRevert("Account is banned");
        registry.updateRole(UserRegistry.UserRole.CREATOR);
        vm.expectRevert("Account is banned");
        registry.recordLogin();
        vm.stopPrank();
    }

    function test_RecordLoginUpdatesTimestamp() public {
        _reg(alice, "alice");
        vm.warp(block.timestamp + 5 days);
        vm.prank(alice);
        registry.recordLogin();
        assertEq(registry.getUserProfile(alice).lastLoginDate, block.timestamp);
    }

    function test_OnlyOwnerFunctions() public {
        _reg(alice, "alice");
        bytes memory err = abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob);
        vm.startPrank(bob);
        vm.expectRevert(err);
        registry.setKYCLevel(alice, UserRegistry.KYCLevel.BASIC);
        vm.expectRevert(err);
        registry.increaseReputation(alice, 1);
        vm.expectRevert(err);
        registry.decreaseReputation(alice, 1);
        vm.expectRevert(err);
        registry.banUser(alice, "x");
        vm.expectRevert(err);
        registry.unbanUser(alice);
        vm.stopPrank();
    }

    function test_OwnerFunctionsRejectUnknownUsers() public {
        vm.expectRevert("User not registered");
        registry.setKYCLevel(carol, UserRegistry.KYCLevel.BASIC);
        vm.expectRevert("User not registered");
        registry.increaseReputation(carol, 1);
        vm.expectRevert("User not registered");
        registry.decreaseReputation(carol, 1);
        vm.expectRevert("User not registered");
        registry.banUser(carol, "x");
        vm.expectRevert("User not registered");
        registry.unbanUser(carol);
        vm.expectRevert("User not registered");
        registry.getUserProfile(carol);
        vm.expectRevert("User not registered");
        registry.getUserKYCLevel(carol);
    }

    function test_KYCLevelGetterAndRequirement() public {
        _reg(alice, "alice");
        registry.setKYCLevel(alice, UserRegistry.KYCLevel.INTERMEDIATE);
        assertEq(uint(registry.getUserKYCLevel(alice)), uint(UserRegistry.KYCLevel.INTERMEDIATE));
        assertTrue(registry.meetsKYCRequirement(alice, UserRegistry.KYCLevel.BASIC));
        assertTrue(registry.meetsKYCRequirement(alice, UserRegistry.KYCLevel.INTERMEDIATE));
        assertFalse(registry.meetsKYCRequirement(alice, UserRegistry.KYCLevel.ADVANCED));
        assertFalse(registry.meetsKYCRequirement(carol, UserRegistry.KYCLevel.NONE)); // not registered
        registry.banUser(alice, "x");
        assertFalse(registry.meetsKYCRequirement(alice, UserRegistry.KYCLevel.NONE)); // banned
    }

    function test_ReputationCapsAndFloors() public {
        _reg(alice, "alice");
        registry.increaseReputation(alice, 5000);
        assertEq(registry.getUserProfile(alice).reputationScore, 1000);
        registry.decreaseReputation(alice, 400);
        assertEq(registry.getUserProfile(alice).reputationScore, 600);
        registry.decreaseReputation(alice, 10_000);
        assertEq(registry.getUserProfile(alice).reputationScore, 0);
    }

    function test_BanAndUnbanGuards() public {
        _reg(alice, "alice");
        vm.expectRevert("Not banned");
        registry.unbanUser(alice);
        registry.banUser(alice, "spam");
        assertEq(registry.totalBannedUsers(), 1);
        vm.expectRevert("Already banned");
        registry.banUser(alice, "again");
        registry.unbanUser(alice);
        assertEq(registry.totalBannedUsers(), 0);
        assertFalse(registry.getUserProfile(alice).isBanned);
    }

    function test_GetUsersIsPaginated() public {
        string[5] memory names = ["u_one", "u_two", "u_three", "u_four", "u_five"];
        for (uint i = 0; i < 5; i++) {
            _reg(address(uint160(0x100 + i)), names[i]);
        }
        address[] memory page1 = registry.getUsers(0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[1], address(0x101));
        address[] memory page3 = registry.getUsers(4, 10); // limit past the end is clamped
        assertEq(page3.length, 1);
        assertEq(page3[0], address(0x104));
        vm.expectRevert("Offset out of bounds");
        registry.getUsers(5, 1);
    }

    function test_StatsAfterBan() public {
        _reg(alice, "alice");
        _reg(bob, "bobby");
        registry.banUser(bob, "x");
        (uint total, uint banned, uint active) = registry.getStats();
        assertEq(total, 2);
        assertEq(banned, 1);
        assertEq(active, 1);
    }

    function testFuzz_UsernamesWithUppercaseAreRejected(uint8 idx) public {
        bytes memory name = "abcdef";
        name[idx % 6] = bytes1(uint8(0x41 + (idx % 26))); // A-Z
        vm.prank(alice);
        vm.expectRevert("Username can only contain lowercase letters, numbers, and underscores");
        registry.registerUser(string(name), "h", "", UserRegistry.UserRole.BACKER);
    }
}
