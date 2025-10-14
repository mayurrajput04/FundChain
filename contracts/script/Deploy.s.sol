// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CampaignFactory.sol";

contract DeployScript is Script {
    function run() external {
        // Get environment variables - THESE WILL BE LOADED FROM YOUR .env FILE
        string memory sepoliaRpc = vm.envString("SEPOLIA_RPC_URL");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Set up the RPC URL
        vm.createSelectFork(sepoliaRpc);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the CampaignFactory
        CampaignFactory factory = new CampaignFactory();
        
        console.log("CampaignFactory deployed to:", address(factory));
        
        vm.stopBroadcast();
    }
}