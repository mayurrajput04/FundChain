// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/UserRegistry.sol";
import "../src/CampaignFactory.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy UserRegistry
        UserRegistry registry = new UserRegistry();
        console.log("=================================");
        console.log("UserRegistry deployed to:", address(registry));
        
        // Deploy CampaignFactory
        CampaignFactory factory = new CampaignFactory(address(registry));
        console.log("CampaignFactory deployed to:", address(factory));
        console.log("=================================");
        console.log("Deployer (admin):", msg.sender);
        console.log("=================================");
        
        vm.stopBroadcast();
        
        // Foundry automatically saves to broadcast/DeployAll.s.sol/11155111/run-latest.json
        console.log("\nDeployment complete!");
        console.log("Run: npm run update-addresses");
    }
}