#!/usr/bin/env node

/**
 * Automatically update contract addresses from Foundry broadcast files
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============ MAIN FUNCTION ============

async function updateAddresses() {
  try {
    log('\n🚀 Starting address update process...\n', 'blue');

    // ✅ Read from Foundry's broadcast file (this always exists)
    const broadcastPath = path.join(
      __dirname, 
      '../contracts/broadcast/DeployAll.s.sol/11155111/run-latest.json'
    );
    
    if (!fs.existsSync(broadcastPath)) {
      log('❌ Error: Deployment broadcast file not found!', 'red');
      log(`   Expected: ${broadcastPath}`, 'yellow');
      log('   Please deploy contracts first using: npm run deploy', 'yellow');
      process.exit(1);
    }

    // Parse Foundry broadcast JSON
    const broadcast = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));
    
    // Extract contract addresses from transactions
    const transactions = broadcast.transactions;
    
    if (!transactions || transactions.length === 0) {
      log('❌ No deployment transactions found!', 'red');
      process.exit(1);
    }

    // Find UserRegistry and CampaignFactory deployments
    let userRegistryAddress = null;
    let factoryAddress = null;

    for (const tx of transactions) {
      if (tx.transactionType === 'CREATE') {
        const contractAddress = tx.contractAddress;
        const contractName = tx.contractName;

        if (contractName === 'UserRegistry') {
          userRegistryAddress = contractAddress;
        } else if (contractName === 'CampaignFactory') {
          factoryAddress = contractAddress;
        }
      }
    }

    if (!userRegistryAddress || !factoryAddress) {
      log('❌ Could not find contract addresses in broadcast file!', 'red');
      log('   UserRegistry: ' + (userRegistryAddress || 'NOT FOUND'), 'yellow');
      log('   CampaignFactory: ' + (factoryAddress || 'NOT FOUND'), 'yellow');
      process.exit(1);
    }

    log('✅ Deployment file loaded:', 'green');
    log(`   Network: Sepolia (Chain ID: 11155111)`, 'yellow');
    log(`   UserRegistry: ${userRegistryAddress}`, 'yellow');
    log(`   CampaignFactory: ${factoryAddress}\n`, 'yellow');

    // Update files
    updateBackendEnv(userRegistryAddress, factoryAddress);
    updateContractsEnv(userRegistryAddress, factoryAddress);
    createFrontendConfig(userRegistryAddress, factoryAddress);
    createSharedConfig(userRegistryAddress, factoryAddress, broadcast);

    log('\n✅ All addresses updated successfully!', 'green');
    log('\n📝 Next steps:', 'blue');
    log('   1. Restart your backend server (if running)', 'yellow');
    log('   2. Restart your frontend (if running)', 'yellow');
    log('   3. Test contract interactions\n', 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// ============ UPDATE FUNCTIONS ============

function updateBackendEnv(registryAddress, factoryAddress) {
  const envPath = path.join(__dirname, '../backend/.env');
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  Backend .env not found, creating...', 'yellow');
    const backendDir = path.join(__dirname, '../backend');
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    fs.writeFileSync(envPath, '');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update or add USER_REGISTRY_ADDRESS
  if (envContent.includes('USER_REGISTRY_ADDRESS=')) {
    envContent = envContent.replace(
      /USER_REGISTRY_ADDRESS=.*/,
      `USER_REGISTRY_ADDRESS=${registryAddress}`
    );
  } else {
    envContent += `\n# Contract Addresses\nUSER_REGISTRY_ADDRESS=${registryAddress}`;
  }
  
  // Update or add FACTORY_ADDRESS
  if (envContent.includes('FACTORY_ADDRESS=')) {
    envContent = envContent.replace(
      /FACTORY_ADDRESS=.*/,
      `FACTORY_ADDRESS=${factoryAddress}`
    );
  } else {
    envContent += `\nFACTORY_ADDRESS=${factoryAddress}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  log('✅ Updated: backend/.env', 'green');
}

function updateContractsEnv(registryAddress, factoryAddress) {
  const envPath = path.join(__dirname, '../contracts/.env');
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  Contracts .env not found, skipping...', 'yellow');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('USER_REGISTRY_ADDRESS=')) {
    envContent = envContent.replace(
      /USER_REGISTRY_ADDRESS=.*/,
      `USER_REGISTRY_ADDRESS=${registryAddress}`
    );
  } else {
    envContent += `\n\n# Deployed Contracts\nUSER_REGISTRY_ADDRESS=${registryAddress}`;
  }
  
  if (envContent.includes('FACTORY_ADDRESS=')) {
    envContent = envContent.replace(
      /FACTORY_ADDRESS=.*/,
      `FACTORY_ADDRESS=${factoryAddress}`
    );
  } else {
    envContent += `\nFACTORY_ADDRESS=${factoryAddress}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  log('✅ Updated: contracts/.env', 'green');
}

function createFrontendConfig(registryAddress, factoryAddress) {
  const configDir = path.join(__dirname, '../frontend/src/config');
  const configPath = path.join(configDir, 'contracts.js');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Get ABIs from Foundry output
  const userRegistryAbiPath = path.join(__dirname, '../contracts/out/UserRegistry.sol/UserRegistry.json');
  const factoryAbiPath = path.join(__dirname, '../contracts/out/CampaignFactory.sol/CampaignFactory.json');

  let userRegistryAbi = [];
  let factoryAbi = [];

  if (fs.existsSync(userRegistryAbiPath)) {
    const userRegistryJson = JSON.parse(fs.readFileSync(userRegistryAbiPath, 'utf8'));
    userRegistryAbi = userRegistryJson.abi;
  }

  if (fs.existsSync(factoryAbiPath)) {
    const factoryJson = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));
    factoryAbi = factoryJson.abi;
  }

  const configContent = `/**
 * Contract addresses and ABIs
 * Auto-generated by deployment scripts
 * DO NOT EDIT MANUALLY
 */

export const CONTRACT_ADDRESSES = {
  userRegistry: "${registryAddress}",
  campaignFactory: "${factoryAddress}"
};

export const HARDCODED_ADMIN_ADDRESS = "0x1b4709064B3050d11Ba2540AbA8B3B4412159697";

export const CONTRACT_ABIS = {
  userRegistry: ${JSON.stringify(userRegistryAbi, null, 2)},
  campaignFactory: ${JSON.stringify(factoryAbi, null, 2)}
};

export default {
  addresses: CONTRACT_ADDRESSES,
  abis: CONTRACT_ABIS,
  admin: HARDCODED_ADMIN_ADDRESS
};
`;

  fs.writeFileSync(configPath, configContent);
  log('✅ Created: frontend/src/config/contracts.js', 'green');
}

function createSharedConfig(registryAddress, factoryAddress, broadcast) {
  const configDir = path.join(__dirname, '../config');
  const configPath = path.join(configDir, 'contracts.json');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const config = {
    network: 'sepolia',
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: broadcast.transactions[0]?.transaction?.from || 'unknown',
    contracts: {
      UserRegistry: {
        address: registryAddress,
        name: 'UserRegistry'
      },
      CampaignFactory: {
        address: factoryAddress,
        name: 'CampaignFactory'
      }
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log('✅ Created: config/contracts.json', 'green');
}

// Run the script
updateAddresses();