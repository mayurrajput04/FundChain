const { ethers } = require('ethers');
const config = require('../../config');  // ✅ Import shared config

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // ✅ Use shared config instead of env variables
    this.userRegistryAddress = config.contracts.userRegistry || process.env.USER_REGISTRY_ADDRESS;
    this.factoryAddress = config.contracts.campaignFactory || process.env.FACTORY_ADDRESS;
    
    // Validate addresses
    if (!this.userRegistryAddress || !this.factoryAddress) {
      throw new Error('Contract addresses not configured! Run: npm run update-addresses');
    }
    
    // ✅ Use ABIs from shared config
    this.userRegistryABI = config.abis.userRegistry;
    this.factoryABI = config.abis.campaignFactory;
    
    // Initialize contracts
    this.userRegistry = new ethers.Contract(
      this.userRegistryAddress,
      this.userRegistryABI,
      this.provider
    );
    
    this.factory = new ethers.Contract(
      this.factoryAddress,
      this.factoryABI,
      this.provider
    );
    
    console.log('✅ Blockchain service initialized:');
    console.log(`   UserRegistry: ${this.userRegistryAddress}`);
    console.log(`   Factory: ${this.factoryAddress}`);
  }
  
  // ... rest of the code
}

module.exports = new BlockchainService();