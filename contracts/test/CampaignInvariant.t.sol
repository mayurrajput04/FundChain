// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/UserRegistry.sol";
import "../src/CampaignFactory.sol";

/// @dev Drives random contribute / refund / withdraw / time-travel calls against one campaign.
contract CampaignHandler is Test {
    Campaign public campaign;
    address[] public actors;
    address public creator;
    uint public withdrawnAmount;

    constructor(Campaign c, address[] memory a, address creator_) {
        campaign = c;
        actors = a;
        creator = creator_;
    }

    function contribute(uint seed, uint amount) external {
        if (block.timestamp >= campaign.deadline()) return;
        address who = actors[seed % actors.length];
        amount = bound(amount, 1, 20 ether);
        vm.prank(who);
        campaign.contribute{value: amount}();
    }

    function refund(uint seed) external {
        address who = actors[seed % actors.length];
        vm.prank(who);
        try campaign.refund() {} catch {}
    }

    function withdraw() external {
        uint before_ = creator.balance;
        vm.prank(creator);
        try campaign.withdrawFunds() {
            withdrawnAmount += creator.balance - before_;
        } catch {}
    }

    function warp(uint secs) external {
        vm.warp(block.timestamp + bound(secs, 0, 20 days));
    }

    function actorsLength() external view returns (uint) {
        return actors.length;
    }
}

contract CampaignInvariantTest is Test {
    Campaign campaign;
    CampaignHandler handler;
    address[] actors;

    function setUp() public {
        UserRegistry registry = new UserRegistry();
        CampaignFactory factory = new CampaignFactory(address(registry));

        address creator = address(0xC0);
        vm.prank(creator);
        registry.registerUser("creator1", "h", "", UserRegistry.UserRole.CREATOR);
        registry.setKYCLevel(creator, UserRegistry.KYCLevel.BASIC);

        for (uint i = 0; i < 4; i++) {
            address a = address(uint160(0xA000 + i));
            string memory name = string(abi.encodePacked("actor", vm.toString(i)));
            vm.prank(a);
            registry.registerUser(name, "h", "", UserRegistry.UserRole.BACKER);
            vm.deal(a, 10_000 ether);
            actors.push(a);
        }

        vm.prank(creator);
        campaign = Campaign(factory.createCampaign("t", 30 ether, 10, "c", "d"));
        campaign.approveCampaign();

        handler = new CampaignHandler(campaign, actors, creator);
        targetContract(address(handler));
    }

    /// Every wei in the contract is either still owed to a backer, or was never booked.
    function invariant_BalanceMatchesBooks() public view {
        uint expected = campaign.totalRaised() - campaign.totalRefunded() - handler.withdrawnAmount();
        assertEq(address(campaign).balance, expected);
    }

    /// The campaign can pay the creator or refund backers, never both.
    function invariant_WithdrawAndRefundAreExclusive() public view {
        assertFalse(campaign.fundsWithdrawn() && campaign.totalRefunded() > 0);
    }

    /// Refunds are only possible when the goal was missed.
    function invariant_RefundsOnlyWhenGoalMissed() public view {
        if (campaign.totalRefunded() > 0) {
            assertLt(campaign.totalRaised(), campaign.goal());
        }
    }

    /// While nothing has been withdrawn, per-backer balances add up to what is left.
    function invariant_BackerBalancesSumToRemaining() public view {
        if (campaign.fundsWithdrawn()) return;
        uint sum;
        for (uint i = 0; i < actors.length; i++) {
            sum += campaign.contributionsByAddress(actors[i]);
        }
        assertEq(sum, campaign.totalRaised() - campaign.totalRefunded());
    }
}
