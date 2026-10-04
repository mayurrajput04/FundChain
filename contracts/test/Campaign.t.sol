// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/UserRegistry.sol";
import "../src/CampaignFactory.sol";

/// @dev A creator that is a contract with no way to receive ETH.
contract RejectingCreator {
    function register(UserRegistry r) external {
        r.registerUser("rejecter", "h", "", UserRegistry.UserRole.CREATOR);
    }

    function create(CampaignFactory f) external returns (address) {
        return f.createCampaign("t", 1 ether, 5, "c", "d");
    }

    function withdraw(Campaign c) external {
        c.withdrawFunds();
    }
}

/// @dev A creator whose receive hook tries to withdraw a second time.
contract ReenteringCreator {
    Campaign public campaign;
    bool public reenterOk;
    bool public entered;

    function register(UserRegistry r) external {
        r.registerUser("reenterc", "h", "", UserRegistry.UserRole.CREATOR);
    }

    function create(CampaignFactory f) external returns (address) {
        campaign = Campaign(f.createCampaign("t", 1 ether, 5, "c", "d"));
        return address(campaign);
    }

    function withdraw() external {
        campaign.withdrawFunds();
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            try campaign.withdrawFunds() {
                reenterOk = true;
            } catch {}
        }
    }
}

/// @dev A backer whose receive hook tries to refund a second time.
contract ReenteringBacker {
    Campaign public campaign;
    bool public reenterOk;
    bool public entered;

    function register(UserRegistry r) external {
        r.registerUser("reenterb", "h", "", UserRegistry.UserRole.BACKER);
    }

    function fund(Campaign c) external payable {
        campaign = c;
        c.contribute{value: msg.value}();
    }

    function doRefund() external {
        campaign.refund();
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            try campaign.refund() {
                reenterOk = true;
            } catch {}
        }
    }
}

/// @dev A backer that refuses to take its refund.
contract RefusingBacker {
    function register(UserRegistry r) external {
        r.registerUser("refuser", "h", "", UserRegistry.UserRole.BACKER);
    }

    function fund(Campaign c) external payable {
        c.contribute{value: msg.value}();
    }

    function doRefund(Campaign c) external {
        c.refund();
    }
}

contract CampaignTest is Test {
    UserRegistry registry;
    CampaignFactory factory;

    address creator = address(0xC0);
    address alice = address(0xA1);
    address bob = address(0xB0);
    address carol = address(0xCA);

    uint constant GOAL = 10 ether;
    uint constant DAYS = 30;

    event Funded(address contributor, uint amount);
    event CampaignApproved();
    event CampaignCompleted();
    event FundsWithdrawn(address indexed creator, uint amount);
    event Refunded(address indexed contributor, uint amount);
    event CampaignCreated(address campaignAddress, address creator, string title, uint goal);

    function setUp() public {
        registry = new UserRegistry();
        factory = new CampaignFactory(address(registry));

        _register(creator, "creator1", UserRegistry.UserRole.CREATOR);
        registry.setKYCLevel(creator, UserRegistry.KYCLevel.BASIC);
        _register(alice, "alice", UserRegistry.UserRole.BACKER);
        _register(bob, "bob", UserRegistry.UserRole.BACKER);
        _register(carol, "carol", UserRegistry.UserRole.BOTH);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }

    // ---------- helpers ----------

    function _register(address who, string memory name, UserRegistry.UserRole role) internal {
        vm.prank(who);
        registry.registerUser(name, "hash", "", role);
    }

    function _create(uint goal, uint daysLong) internal returns (Campaign) {
        vm.prank(creator);
        return Campaign(factory.createCampaign("Title", goal, daysLong, "Education", "Desc"));
    }

    function _approved(uint goal, uint daysLong) internal returns (Campaign c) {
        c = _create(goal, daysLong);
        c.approveCampaign();
    }

    function _fund(Campaign c, address who, uint amount) internal {
        vm.prank(who);
        c.contribute{value: amount}();
    }

    function _pastDeadline(Campaign c) internal {
        vm.warp(c.deadline());
    }

    // ---------- factory ----------

    function test_FactoryDefaults() public view {
        assertEq(factory.admin(), address(this));
        assertTrue(factory.isAdmin(address(this)));
        assertFalse(factory.isAdmin(alice));
        assertEq(address(factory.userRegistry()), address(registry));
        assertEq(uint(factory.minKYCForCreation()), uint(UserRegistry.KYCLevel.BASIC));
        assertEq(uint(factory.minKYCForContribution()), uint(UserRegistry.KYCLevel.NONE));
        assertEq(factory.MAX_DURATION_DAYS(), 365);
    }

    function test_CreateCampaignStoresTermsAndEmits() public {
        vm.prank(creator);
        vm.recordLogs();
        address addr = factory.createCampaign("Title", GOAL, DAYS, "Medical", "Story");
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        assertEq(logs[0].topics[0], CampaignCreated.selector);

        Campaign c = Campaign(addr);
        assertEq(c.creator(), creator);
        assertEq(c.title(), "Title");
        assertEq(c.category(), "Medical");
        assertEq(c.description(), "Story");
        assertEq(c.goal(), GOAL);
        assertEq(c.deadline(), block.timestamp + DAYS * 1 days);
        assertFalse(c.isApproved());
        assertTrue(c.isActive());
        assertEq(factory.getDeployedCampaigns().length, 1);
        assertEq(factory.getDeployedCampaigns()[0], addr);
        assertEq(factory.deployedCampaigns(0), addr);
    }

    function test_CreateRevertsForUnregistered() public {
        vm.prank(address(0xDEAD));
        vm.expectRevert("You must register first before creating campaigns");
        factory.createCampaign("t", GOAL, DAYS, "c", "d");
    }

    function test_CreateRevertsWithoutKYC() public {
        _register(address(0xE1), "eve", UserRegistry.UserRole.CREATOR);
        vm.prank(address(0xE1));
        vm.expectRevert("Insufficient KYC level to create campaign");
        factory.createCampaign("t", GOAL, DAYS, "c", "d");
    }

    function test_CreateRevertsForBackerRole() public {
        registry.setKYCLevel(alice, UserRegistry.KYCLevel.BASIC);
        vm.prank(alice);
        vm.expectRevert(
            "Backers cannot create campaigns. Please change your role to CREATOR or BOTH in your profile settings."
        );
        factory.createCampaign("t", GOAL, DAYS, "c", "d");
    }

    function test_CreateRevertsForBannedUser() public {
        registry.banUser(creator, "spam");
        vm.prank(creator);
        // meetsKYCRequirement is false for banned users, so the KYC check fires first.
        vm.expectRevert("Insufficient KYC level to create campaign");
        factory.createCampaign("t", GOAL, DAYS, "c", "d");
    }

    function test_CreateRevertsOnZeroGoal() public {
        vm.prank(creator);
        vm.expectRevert("Goal must be > 0");
        factory.createCampaign("t", 0, DAYS, "c", "d");
    }

    function test_CreateRevertsOnBadDuration() public {
        vm.startPrank(creator);
        vm.expectRevert("Deadline must be 1-365 days");
        factory.createCampaign("t", GOAL, 0, "c", "d");
        vm.expectRevert("Deadline must be 1-365 days");
        factory.createCampaign("t", GOAL, 366, "c", "d");
        vm.stopPrank();
        // the edges are allowed
        vm.startPrank(creator);
        factory.createCampaign("t", GOAL, 1, "c", "d");
        factory.createCampaign("t", GOAL, 365, "c", "d");
        vm.stopPrank();
        assertEq(factory.getDeployedCampaigns().length, 2);
    }

    function test_AdminCanChangeKYCRequirements() public {
        factory.setMinKYCForCreation(UserRegistry.KYCLevel.ADVANCED);
        assertEq(uint(factory.minKYCForCreation()), uint(UserRegistry.KYCLevel.ADVANCED));
        factory.setMinKYCForContribution(UserRegistry.KYCLevel.INTERMEDIATE);
        assertEq(uint(factory.minKYCForContribution()), uint(UserRegistry.KYCLevel.INTERMEDIATE));
    }

    function test_NonAdminCannotChangeKYCRequirements() public {
        vm.startPrank(alice);
        vm.expectRevert("Only admin");
        factory.setMinKYCForCreation(UserRegistry.KYCLevel.NONE);
        vm.expectRevert("Only admin");
        factory.setMinKYCForContribution(UserRegistry.KYCLevel.NONE);
        vm.stopPrank();
    }

    // ---------- approval ----------

    function test_AdminApproves() public {
        Campaign c = _create(GOAL, DAYS);
        vm.expectEmit(address(c));
        emit CampaignApproved();
        c.approveCampaign();
        assertTrue(c.isApproved());
    }

    function test_NonAdminCannotApprove() public {
        Campaign c = _create(GOAL, DAYS);
        vm.prank(alice);
        vm.expectRevert("Only admin can approve");
        c.approveCampaign();
        vm.prank(creator);
        vm.expectRevert("Only admin can approve");
        c.approveCampaign();
    }

    function test_CannotApproveTwice() public {
        Campaign c = _approved(GOAL, DAYS);
        vm.expectRevert("Already approved");
        c.approveCampaign();
    }

    // ---------- contribute ----------

    function test_ContributeRevertsBeforeApproval() public {
        Campaign c = _create(GOAL, DAYS);
        vm.prank(alice);
        vm.expectRevert("Campaign not approved yet");
        c.contribute{value: 1 ether}();
    }

    function test_ContributeRevertsAfterDeadline() public {
        Campaign c = _approved(GOAL, DAYS);
        _pastDeadline(c);
        vm.prank(alice);
        vm.expectRevert("Campaign ended");
        c.contribute{value: 1 ether}();
    }

    function test_ContributeRevertsOnZeroValue() public {
        Campaign c = _approved(GOAL, DAYS);
        vm.prank(alice);
        vm.expectRevert("Contribution must be > 0");
        c.contribute{value: 0}();
    }

    function test_CreatorCannotFundOwnCampaign() public {
        Campaign c = _approved(GOAL, DAYS);
        vm.deal(creator, 5 ether);
        vm.prank(creator);
        vm.expectRevert("Cannot contribute to your own campaign");
        c.contribute{value: 1 ether}();
    }

    function test_UnregisteredCannotContribute() public {
        Campaign c = _approved(GOAL, DAYS);
        address stranger = address(0x5757);
        vm.deal(stranger, 1 ether);
        vm.prank(stranger);
        vm.expectRevert("You must register before contributing");
        c.contribute{value: 1 ether}();
    }

    function test_ContributeRespectsRaisedKYCRequirement() public {
        Campaign c = _approved(GOAL, DAYS);
        factory.setMinKYCForContribution(UserRegistry.KYCLevel.BASIC);
        vm.prank(alice);
        vm.expectRevert("Insufficient KYC level to contribute");
        c.contribute{value: 1 ether}();
        registry.setKYCLevel(alice, UserRegistry.KYCLevel.BASIC);
        _fund(c, alice, 1 ether);
        assertEq(c.contributionsByAddress(alice), 1 ether);
    }

    function test_BannedUserCannotContribute() public {
        Campaign c = _approved(GOAL, DAYS);
        registry.banUser(alice, "x");
        vm.prank(alice);
        // meetsKYCRequirement returns false for banned users, so that check fires first
        vm.expectRevert("Insufficient KYC level to contribute");
        c.contribute{value: 1 ether}();
    }

    function test_ContributeTracksTotalsAndUniqueBackers() public {
        Campaign c = _approved(GOAL, DAYS);
        vm.expectEmit(address(c));
        emit Funded(alice, 2 ether);
        _fund(c, alice, 2 ether);
        _fund(c, alice, 1 ether);
        _fund(c, bob, 3 ether);

        assertEq(c.totalRaised(), 6 ether);
        assertEq(address(c).balance, 6 ether);
        assertEq(c.contributionsByAddress(alice), 3 ether);
        assertEq(c.contributionsByAddress(bob), 3 ether);
        assertTrue(c.hasContributed(alice));
        assertFalse(c.hasContributed(carol));
        assertEq(c.uniqueBackersCount(), 2);
        assertEq(c.getContributorsCount(), 2);
        assertEq(c.getTotalContributions(), 3);
        (address who, uint amt, uint ts) = c.contributions(2);
        assertEq(who, bob);
        assertEq(amt, 3 ether);
        assertEq(ts, block.timestamp);
    }

    function test_CompletedEventWhenGoalReached() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 9 ether);
        vm.expectEmit(address(c));
        emit CampaignCompleted();
        _fund(c, bob, 1 ether);
    }

    function test_GetCampaignDetails() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 4 ether);
        (
            address cr,
            string memory title,
            string memory category,
            string memory description,
            uint goal,
            uint deadline,
            uint raised,
            uint backers,
            bool approved,
            bool active,
            uint balance
        ) = c.getCampaignDetails();
        assertEq(cr, creator);
        assertEq(title, "Title");
        assertEq(category, "Education");
        assertEq(description, "Desc");
        assertEq(goal, GOAL);
        assertEq(deadline, c.deadline());
        assertEq(raised, 4 ether);
        assertEq(backers, 1);
        assertTrue(approved);
        assertTrue(active);
        assertEq(balance, 4 ether);
    }

    // ---------- withdraw ----------

    function test_CreatorWithdrawsAfterGoalAndDeadline() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 6 ether);
        _fund(c, bob, 5 ether);
        _pastDeadline(c);

        uint before_ = creator.balance;
        vm.expectEmit(address(c));
        emit FundsWithdrawn(creator, 11 ether);
        vm.prank(creator);
        c.withdrawFunds();

        assertEq(creator.balance - before_, 11 ether);
        assertEq(address(c).balance, 0);
        assertTrue(c.fundsWithdrawn());
    }

    function test_WithdrawRevertsForNonCreator() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        _pastDeadline(c);
        vm.prank(alice);
        vm.expectRevert("Only creator can call this");
        c.withdrawFunds();
    }

    function test_WithdrawRevertsBeforeDeadline() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        vm.prank(creator);
        vm.expectRevert("Campaign not ended");
        c.withdrawFunds();
    }

    function test_WithdrawRevertsWhenGoalMissed() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL - 1);
        _pastDeadline(c);
        vm.prank(creator);
        vm.expectRevert("Goal not reached");
        c.withdrawFunds();
    }

    function test_WithdrawTwiceReverts() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        _pastDeadline(c);
        vm.startPrank(creator);
        c.withdrawFunds();
        vm.expectRevert("Already withdrawn");
        c.withdrawFunds();
        vm.stopPrank();
    }

    function test_WithdrawCannotBeFollowedByRefund() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        _pastDeadline(c);
        vm.prank(creator);
        c.withdrawFunds();
        vm.prank(alice);
        vm.expectRevert("Goal was reached");
        c.refund();
    }

    function test_ForcedEthDoesNotChangeWithdrawAmount() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        // simulate a selfdestruct-style forced send
        vm.deal(address(c), address(c).balance + 1 ether);
        _pastDeadline(c);
        uint before_ = creator.balance;
        vm.prank(creator);
        c.withdrawFunds();
        assertEq(creator.balance - before_, GOAL);
    }

    function test_ContractCreatorThatRejectsEthCannotWithdrawButFundsStayIntact() public {
        RejectingCreator rc = new RejectingCreator();
        rc.register(registry);
        registry.setKYCLevel(address(rc), UserRegistry.KYCLevel.BASIC);
        Campaign c = Campaign(rc.create(factory));
        c.approveCampaign();
        _fund(c, alice, 1 ether);
        _pastDeadline(c);

        vm.expectRevert("Transfer failed");
        rc.withdraw(c);
        assertFalse(c.fundsWithdrawn());
        assertEq(address(c).balance, 1 ether);
    }

    function test_CreatorCannotReenterWithdraw() public {
        ReenteringCreator rc = new ReenteringCreator();
        rc.register(registry);
        registry.setKYCLevel(address(rc), UserRegistry.KYCLevel.BASIC);
        Campaign c = Campaign(rc.create(factory));
        c.approveCampaign();
        _fund(c, alice, 1 ether);
        _fund(c, bob, 1 ether);
        _pastDeadline(c);

        rc.withdraw();
        assertTrue(rc.entered());
        assertFalse(rc.reenterOk());
        assertEq(address(rc).balance, 2 ether);
        assertEq(address(c).balance, 0);
    }

    // ---------- refund ----------

    function test_BackersRefundWhenGoalMissed() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 3 ether);
        _fund(c, alice, 1 ether);
        _fund(c, bob, 2 ether);
        _pastDeadline(c);

        uint aliceBefore = alice.balance;
        vm.expectEmit(address(c));
        emit Refunded(alice, 4 ether);
        vm.prank(alice);
        c.refund();
        assertEq(alice.balance - aliceBefore, 4 ether);
        assertEq(c.contributionsByAddress(alice), 0);
        assertEq(address(c).balance, 2 ether);

        uint bobBefore = bob.balance;
        vm.prank(bob);
        c.refund();
        assertEq(bob.balance - bobBefore, 2 ether);
        assertEq(address(c).balance, 0);
        assertEq(c.totalRefunded(), 6 ether);
        assertEq(c.totalRaised(), 6 ether);
    }

    function test_RefundRevertsBeforeDeadline() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert("Campaign not ended");
        c.refund();
    }

    function test_RefundRevertsWhenGoalReached() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, GOAL);
        _pastDeadline(c);
        vm.prank(alice);
        vm.expectRevert("Goal was reached");
        c.refund();
    }

    function test_RefundRevertsWithNothingToRefund() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 1 ether);
        _pastDeadline(c);
        vm.prank(carol);
        vm.expectRevert("Nothing to refund");
        c.refund();
    }

    function test_RefundTwiceReverts() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 1 ether);
        _pastDeadline(c);
        vm.startPrank(alice);
        c.refund();
        vm.expectRevert("Nothing to refund");
        c.refund();
        vm.stopPrank();
    }

    function test_BannedBackerCanStillRefund() public {
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, 1 ether);
        registry.banUser(alice, "x");
        _pastDeadline(c);
        uint before_ = alice.balance;
        vm.prank(alice);
        c.refund();
        assertEq(alice.balance - before_, 1 ether);
    }

    function test_RefundWorksOnTheDeadlineBlock() public {
        Campaign c = _approved(GOAL, 1);
        _fund(c, alice, 1 ether);
        vm.warp(c.deadline() - 1);
        vm.prank(alice);
        vm.expectRevert("Campaign not ended");
        c.refund();
        vm.warp(c.deadline());
        vm.prank(alice);
        c.refund();
    }

    function test_ContributeAndRefundCannotBothBeOpen() public {
        // At t == deadline contribute is closed and refund is open, one block earlier the reverse.
        Campaign c = _approved(GOAL, 1);
        vm.warp(c.deadline() - 1);
        _fund(c, alice, 1 ether);
        vm.warp(c.deadline());
        vm.prank(bob);
        vm.expectRevert("Campaign ended");
        c.contribute{value: 1 ether}();
    }

    function test_BackerCannotReenterRefund() public {
        ReenteringBacker rb = new ReenteringBacker();
        rb.register(registry);
        Campaign c = _approved(GOAL, DAYS);
        rb.fund{value: 1 ether}(c);
        _fund(c, alice, 2 ether); // other money in the pot that a reentrant call could steal
        _pastDeadline(c);

        rb.doRefund();
        assertTrue(rb.entered());
        assertFalse(rb.reenterOk());
        assertEq(address(rb).balance, 1 ether);
        assertEq(address(c).balance, 2 ether);
    }

    function test_BackerThatRefusesRefundOnlyBlocksItself() public {
        RefusingBacker rf = new RefusingBacker();
        rf.register(registry);
        Campaign c = _approved(GOAL, DAYS);
        rf.fund{value: 1 ether}(c);
        _fund(c, alice, 2 ether);
        _pastDeadline(c);

        vm.expectRevert("Refund failed");
        rf.doRefund(c);
        // the contract's own money is still booked to it
        assertEq(c.contributionsByAddress(address(rf)), 1 ether);

        // everyone else is unaffected
        vm.prank(alice);
        c.refund();
        assertEq(address(c).balance, 1 ether);
    }

    // ---------- fuzz ----------

    function testFuzz_RefundsReturnExactlyWhatWasPaid(uint96 a, uint96 b, uint96 c_) public {
        uint x = bound(a, 1, 3 ether);
        uint y = bound(b, 1, 3 ether);
        uint z = bound(c_, 1, 3 ether);
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, x);
        _fund(c, bob, y);
        _fund(c, alice, z);
        _pastDeadline(c);

        uint aBefore = alice.balance;
        uint bBefore = bob.balance;
        vm.prank(alice);
        c.refund();
        vm.prank(bob);
        c.refund();

        assertEq(alice.balance - aBefore, x + z);
        assertEq(bob.balance - bBefore, y);
        assertEq(address(c).balance, 0);
        assertEq(c.totalRefunded(), c.totalRaised());
    }

    function testFuzz_CreatorGetsExactlyTotalRaised(uint96 a, uint96 b) public {
        uint x = bound(a, 1, 50 ether);
        uint y = bound(b, 0, 50 ether);
        Campaign c = _approved(GOAL, DAYS);
        _fund(c, alice, x);
        if (y > 0) _fund(c, bob, y);
        _pastDeadline(c);

        if (x + y >= GOAL) {
            uint before_ = creator.balance;
            vm.prank(creator);
            c.withdrawFunds();
            assertEq(creator.balance - before_, x + y);
        } else {
            vm.prank(creator);
            vm.expectRevert("Goal not reached");
            c.withdrawFunds();
        }
    }
}
