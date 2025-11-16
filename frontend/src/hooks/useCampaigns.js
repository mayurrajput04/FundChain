import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

// ✅ IMPORT THE CONFIG PROPERLY
import contractConfig from '../config/contracts';

// ✅ DEBUGGING: Log what we imported
console.log('🔍 Contract Config Loaded:', {
  hasConfig: !!contractConfig,
  hasAddresses: !!contractConfig?.addresses,
  hasAbis: !!contractConfig?.abis,
  factoryAddress: contractConfig?.addresses?.campaignFactory,
  factoryAbiLength: contractConfig?.abis?.campaignFactory?.length,
  registryAddress: contractConfig?.addresses?.userRegistry,
  registryAbiLength: contractConfig?.abis?.userRegistry?.length
});

// ✅ EXTRACT VALUES
const FACTORY_ADDRESS = contractConfig?.addresses?.campaignFactory;
const USER_REGISTRY_ADDRESS = contractConfig?.addresses?.userRegistry;
const CAMPAIGN_FACTORY_ABI = contractConfig?.abis?.campaignFactory;
const USER_REGISTRY_ABI = contractConfig?.abis?.userRegistry;
const CAMPAIGN_ABI = contractConfig?.abis?.campaign; // ✅ CHANGED: Import from config
const HARDCODED_ADMIN_ADDRESS = contractConfig?.admin || "0x1b4709064B3050d11Ba2540AbA8B3B4412159697";

// ✅ VALIDATE ON LOAD
if (!FACTORY_ADDRESS || !USER_REGISTRY_ADDRESS) {
  console.error('❌ CONTRACT ADDRESSES MISSING!');
  console.error('   Factory:', FACTORY_ADDRESS);
  console.error('   Registry:', USER_REGISTRY_ADDRESS);
  console.error('   Config:', contractConfig);
}

if (!CAMPAIGN_FACTORY_ABI || CAMPAIGN_FACTORY_ABI.length === 0) {
  console.error('❌ CAMPAIGN FACTORY ABI MISSING OR EMPTY!');
  console.error('   ABI:', CAMPAIGN_FACTORY_ABI);
}

if (!USER_REGISTRY_ABI || USER_REGISTRY_ABI.length === 0) {
  console.error('❌ USER REGISTRY ABI MISSING OR EMPTY!');
  console.error('   ABI:', USER_REGISTRY_ABI);
}

// ✅ Log the createCampaign function from ABI
const createCampaignABI = CAMPAIGN_FACTORY_ABI?.find(
  item => item.type === 'function' && item.name === 'createCampaign'
);
console.log('🔍 createCampaign ABI found:', !!createCampaignABI);
if (createCampaignABI) {
  console.log('   Inputs:', createCampaignABI.inputs?.map(i => `${i.name}: ${i.type}`));
}



// // 🔒 HARDCODED ADMIN ADDRESS - ONLY THIS ADDRESS HAS ADMIN RIGHTS
// const HARDCODED_ADMIN_ADDRESS = "0x1b4709064B3050d11Ba2540AbA8B3B4412159697";

// // Factory contract address
// ✅ EXTRACT VALUES

export const useCampaigns = () => { 
  const { signer, account, isConnected } = useWeb3();
  const [factoryContract, setFactoryContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contractAdminAddress, setContractAdminAddress] = useState(null);

  // Validate addresses on load
  useEffect(() => {
    if (!FACTORY_ADDRESS || !USER_REGISTRY_ADDRESS) {
      console.error('❌ Contract addresses not configured!');
      console.error('Please run: npm run update-addresses');
      setError('Contract addresses not configured. Please deploy contracts first.');
    } else {
      console.log('✅ Contract addresses loaded:');
      console.log('   Factory:', FACTORY_ADDRESS);
      console.log('   UserRegistry:', USER_REGISTRY_ADDRESS);
    }
  }, []);

  // Initialize factory contract
  useEffect(() => {
    if (signer && isConnected && FACTORY_ADDRESS) {
      try {
        if (!ethers.isAddress(FACTORY_ADDRESS)) {
          console.error('❌ Invalid factory address:', FACTORY_ADDRESS);
          setError('Invalid factory contract address');
          return;
        }

        const contract = new ethers.Contract(FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI, signer);
        setFactoryContract(contract);
        console.log('✅ Factory contract initialized:', FACTORY_ADDRESS);
      } catch (err) {
        console.error('❌ Error initializing contract:', err);
        setError('Failed to initialize contract: ' + err.message);
      }
    }
  }, [signer, isConnected]);

  // Check if current user is HARDCODED admin
  useEffect(() => {
    if (account) {
      const isHardcodedAdmin = account.toLowerCase() === HARDCODED_ADMIN_ADDRESS.toLowerCase();
      setIsAdmin(isHardcodedAdmin);
      
      console.log('🔐 Admin Check:');
      console.log('  Current Account:', account);
      console.log('  Hardcoded Admin:', HARDCODED_ADMIN_ADDRESS);
      console.log('  Is Admin?', isHardcodedAdmin ? '✅ YES' : '❌ NO');
      
      if (isHardcodedAdmin) {
        console.log('👑 ADMIN ACCESS GRANTED');
      }
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  // Get contract admin address for debugging
  useEffect(() => {
    const getContractAdmin = async () => {
      if (factoryContract) {
        try {
          const adminAddr = await factoryContract.admin();
          setContractAdminAddress(adminAddr);
          console.log('📋 Contract Admin (from blockchain):', adminAddr);
          console.log('🔒 Hardcoded Admin (frontend):', HARDCODED_ADMIN_ADDRESS);
          
          if (adminAddr.toLowerCase() !== HARDCODED_ADMIN_ADDRESS.toLowerCase()) {
            console.warn('⚠️ WARNING: Contract admin differs from hardcoded admin!');
            console.warn('  You may need to use the contract admin address to approve campaigns');
          }
        } catch (err) {
          console.error('❌ Error fetching contract admin:', err);
        }
      }
    };
    getContractAdmin();
  }, [factoryContract]);

  const loadCampaigns = useCallback(async (showLoader = true) => {
    if (!factoryContract) {
      console.log('⚠️ No factory contract available');
      return;
    }

    if (showLoader) setLoading(true);
    setError(null);

    try {
      console.log('📡 Loading campaigns from factory...');
      const campaignAddresses = await factoryContract.getDeployedCampaigns();
      console.log('📋 Found campaign addresses:', campaignAddresses.length);
      
      if (campaignAddresses.length === 0) {
        console.log('ℹ️ No campaigns found');
        setCampaigns([]);
        if (showLoader) setLoading(false);
        return;
      }

      const campaignDetails = await Promise.all(
        campaignAddresses.map(async (address, index) => {
          try {
            console.log(`  Loading campaign ${index + 1}/${campaignAddresses.length}: ${address}`);
            const campaignContract = new ethers.Contract(address, CAMPAIGN_ABI, signer);
            const details = await campaignContract.getCampaignDetails();
            
            return {
              address,
              creator: details[0],
              title: details[1],
              category: details[2],
              description: details[3],
              goal: ethers.formatEther(details[4]),
              deadline: Number(details[5]) * 1000,
              totalRaised: ethers.formatEther(details[6]),
              backers: Number(details[7]),
              isApproved: details[8],
              isActive: details[9],
              balance: ethers.formatEther(details[10])
            };
          } catch (err) {
            console.error(`❌ Error loading campaign ${address}:`, err);
            return null;
          }
        })
      );

      const validCampaigns = campaignDetails.filter(campaign => campaign !== null);
      setCampaigns(validCampaigns);
      console.log('✅ Loaded campaigns:', validCampaigns.length);
      console.log('  Approved:', validCampaigns.filter(c => c.isApproved).length);
      console.log('  Pending:', validCampaigns.filter(c => !c.isApproved).length);
    } catch (err) {
      console.error('❌ Error loading campaigns:', err);
      setError('Failed to load campaigns: ' + err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [factoryContract, signer]);

  const createCampaign = useCallback(async (campaignData) => {
    if (!factoryContract) {
      throw new Error('Contract not initialized. Please check your factory address.');
    }

    // BLOCK ADMIN FROM CREATING CAMPAIGNS
    if (isAdmin) {
      throw new Error('❌ Admin cannot create campaigns. Admin role is only for verification and approval.');
    }

    try {
      const { title, goal, deadline, category, description } = campaignData;
      
      console.log('🚀 Creating campaign:', title);

      const tx = await factoryContract.createCampaign(
        title,
        ethers.parseEther(goal),
        deadline,
        category,
        description,
        { gasLimit: 3000000  }
      );

      console.log('📝 Transaction sent:', tx.hash);
      const receipt = await tx.wait(1);
      console.log('✅ Campaign created!');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadCampaigns(false);
      
      return receipt;
    } catch (err) {
      console.error('❌ Error creating campaign:', err);
      if (err.message.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (err.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction');
      } else if (err.message.includes('Admin cannot create')) {
        throw err;
      } else {
        throw new Error('Failed to create campaign: ' + err.message);
      }
    }
  }, [factoryContract, isAdmin, loadCampaigns]);

const contributeToCampaign = useCallback(async (campaignAddress, amount) => {
  if (!signer) throw new Error('Wallet not connected');

  // BLOCK ADMIN FROM CONTRIBUTING
  if (isAdmin) {
    throw new Error('❌ Admin cannot contribute to campaigns. Admin role is only for verification and approval.');
  }

  try {
    console.log('💰 Contributing to campaign:', campaignAddress);
    
    // ✅ FIXED: Get campaign details to check if user is creator
    const campaignContract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, signer);
    const details = await campaignContract.getCampaignDetails();
    const campaignCreator = details[0];
    
    // ✅ FIXED: Prevent self-donation (frontend check)
    if (campaignCreator.toLowerCase() === account.toLowerCase()) {
      throw new Error('❌ You cannot contribute to your own campaign.');
    }
    
    const tx = await campaignContract.contribute({
      value: ethers.parseEther(amount),
      gasLimit: 500000
    });

    console.log('📝 Contribution transaction sent:', tx.hash);
    const receipt = await tx.wait(1);
    console.log('✅ Contribution successful!');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadCampaigns(false);
    
    return receipt;
  } catch (err) {
    console.error('❌ Error contributing:', err);
    
    // ✅ FIXED: Better error messages
    if (err.message.includes('user rejected')) {
      throw new Error('Transaction was rejected by user');
    } else if (err.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    } else if (err.message.includes('Cannot contribute to your own campaign')) {
      throw new Error('You cannot contribute to your own campaign');
    } else if (err.message.includes('Admin cannot contribute')) {
      throw err;
    } else {
      throw new Error('Failed to contribute: ' + err.message);
    }
  }
}, [signer, isAdmin, account, loadCampaigns]); // ✅ FIXED: Added account dependency

  const approveCampaign = useCallback(async (campaignAddress) => {
    if (!signer) throw new Error('Wallet not connected');
    
    // ONLY HARDCODED ADMIN CAN APPROVE
    if (!isAdmin) {
      throw new Error('❌ Only the hardcoded admin can approve campaigns');
    }

    try {
      console.log('🔐 Admin approving campaign:', campaignAddress);
      console.log('  Admin account:', account);
      
      const campaignContract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, signer);
      
      // Check current approval status
      const details = await campaignContract.getCampaignDetails();
      console.log('  Current approval status:', details[8]);
      
      if (details[8]) {
        throw new Error('This campaign is already approved');
      }
      
      const tx = await campaignContract.approveCampaign({
        gasLimit: 200000
      });
      
      console.log('📝 Approval transaction sent:', tx.hash);
      console.log('  Waiting for confirmation...');
      
      const receipt = await tx.wait(1);
      console.log('✅ Campaign approved successfully!');
      console.log('  Receipt:', receipt);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadCampaigns(false);
      
      return receipt;
    } catch (err) {
      console.error('❌ Error approving campaign:', err);
      
      if (err.message.includes('Only admin can approve')) {
        throw new Error('Only admin can approve campaigns. Make sure you deployed the contract with this address as admin.');
      } else if (err.message.includes('already approved')) {
        throw err;
      } else {
        throw new Error('Failed to approve campaign: ' + err.message);
      }
    }
  }, [signer, isAdmin, account, loadCampaigns]);

  useEffect(() => {
    if (factoryContract) {
      loadCampaigns();
    }
  }, [factoryContract, loadCampaigns]);

  useEffect(() => {
    if (!factoryContract) return;

    const handleCampaignCreated = (campaignAddress, creator, title) => {
      console.log('🎉 New campaign created:', title);
      loadCampaigns(false);
    };

    factoryContract.on('CampaignCreated', handleCampaignCreated);

    return () => {
      factoryContract.off('CampaignCreated', handleCampaignCreated);
    };
  }, [factoryContract, loadCampaigns]);

  const debugCampaign = useCallback(async (campaignAddress) => {
  if (!signer) return;

  try {
    console.log('🔍 ========== DEBUG CAMPAIGN ==========');
    console.log('Campaign Address:', campaignAddress);
    
    const campaignContract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, signer);
    
    // Get campaign details
    const details = await campaignContract.getCampaignDetails();
    console.log('📋 Campaign Details:');
    console.log('  Creator:', details[0]);
    console.log('  Title:', details[1]);
    console.log('  Is Approved:', details[8]);
    console.log('  Is Active:', details[9]);
    
    // Check who can approve
    console.log('🔐 Admin Check:');
    console.log('  Current account:', account);
    console.log('  Hardcoded admin:', HARDCODED_ADMIN_ADDRESS);
    
    // Check factory admin
    if (factoryContract) {
      const factoryAdmin = await factoryContract.admin();
      console.log('  Factory admin:', factoryAdmin);
      
      const isFactoryAdmin = await factoryContract.isAdmin(account);
      console.log('  Is factory admin?', isFactoryAdmin);
    }
    
    // Try to get campaign's factory reference (if it exists)
    try {
      // Some contracts store factory address
      const factory = await campaignContract.factory();
      console.log('  Campaign factory ref:', factory);
    } catch (e) {
      console.log('  Campaign has no factory reference');
    }
    
    console.log('🔍 ====================================');
    
  } catch (err) {
    console.error('Debug error:', err);
  }
}, [signer, account, factoryContract]);

  return {
    campaigns,
    loading,
    error,
    isAdmin,
    hardcodedAdminAddress: HARDCODED_ADMIN_ADDRESS,
    contractAdminAddress,
    createCampaign,
    contributeToCampaign,
    approveCampaign,
    refreshCampaigns: loadCampaigns,
    debugCampaign 
  };
};