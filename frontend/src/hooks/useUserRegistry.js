// Add these imports at the top if not already present
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import contractConfig from '../config/contracts';

const USER_REGISTRY_ADDRESS = contractConfig?.addresses?.userRegistry;
const USER_REGISTRY_ABI = contractConfig?.abis?.userRegistry || [];

export const useUserRegistry = () => {
  const { signer, account, isConnected } = useWeb3();
  const [userRegistryContract, setUserRegistryContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [kycLevel, setKycLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // NEW: Check if user is contract owner

  // Initialize UserRegistry contract
  useEffect(() => {
    if (signer && isConnected && USER_REGISTRY_ADDRESS) {
      try {
        if (!ethers.isAddress(USER_REGISTRY_ADDRESS)) {
          console.error('❌ Invalid UserRegistry address:', USER_REGISTRY_ADDRESS);
          setError('Invalid UserRegistry contract address');
          return;
        }

        const contract = new ethers.Contract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, signer);
        setUserRegistryContract(contract);
        console.log('✅ UserRegistry contract initialized:', USER_REGISTRY_ADDRESS);
      } catch (err) {
        console.error('❌ Error initializing UserRegistry:', err);
        setError('Failed to initialize UserRegistry: ' + err.message);
      }
    }
  }, [signer, isConnected]);

  // Check if current user is contract owner (admin)
  useEffect(() => {
    const checkOwner = async () => {
      if (userRegistryContract && account) {
        try {
          const owner = await userRegistryContract.owner();
          const isOwn = owner.toLowerCase() === account.toLowerCase();
          setIsOwner(isOwn);
          
          console.log('🔐 UserRegistry Owner Check:');
          console.log('  Contract Owner:', owner);
          console.log('  Current Account:', account);
          console.log('  Is Owner?', isOwn ? '✅ YES' : '❌ NO');
        } catch (err) {
          console.error('Error checking owner:', err);
          setIsOwner(false);
        }
      }
    };
    checkOwner();
  }, [userRegistryContract, account]);

  // Check if user is registered
  const checkRegistration = useCallback(async () => {
    if (!userRegistryContract || !account) {
      setIsRegistered(false);
      setUserProfile(null);
      setKycLevel(null);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Checking registration for:', account);
      
      const registered = await userRegistryContract.isRegistered(account);
      setIsRegistered(registered);
      
      console.log('  Is Registered:', registered);

      if (registered) {
        const profile = await userRegistryContract.getUserProfile(account);
        const profileData = {
          walletAddress: profile.walletAddress,
          username: profile.username,
          emailHash: profile.emailHash,
          profileImageHash: profile.profileImageHash,
          kycLevel: Number(profile.kycLevel),
          primaryRole: Number(profile.primaryRole),
          registrationDate: Number(profile.registrationDate) * 1000,
          lastLoginDate: Number(profile.lastLoginDate) * 1000,
          isActive: profile.isActive,
          isBanned: profile.isBanned,
          reputationScore: Number(profile.reputationScore)
        };
        
        setUserProfile(profileData);
        setKycLevel(Number(profile.kycLevel));
        
        console.log('  Profile:', profileData);
        console.log('  KYC Level:', Number(profile.kycLevel), getKYCLevelName(Number(profile.kycLevel)));
      } else {
        setUserProfile(null);
        setKycLevel(null);
      }
    } catch (err) {
      console.error('❌ Error checking registration:', err);
      setError('Failed to check registration: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userRegistryContract, account]);

  // Auto-check registration when contract/account changes
  useEffect(() => {
    if (userRegistryContract && account) {
      checkRegistration();
    }
  }, [userRegistryContract, account, checkRegistration]);

  // Register new user
  const registerUser = useCallback(async (username, email, profileImage, role) => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    setLoading(true);
    try {
      console.log('📝 Registering user:', username);

      const emailHash = ethers.keccak256(ethers.toUtf8Bytes(email.toLowerCase()));
      
      console.log('  Username:', username);
      console.log('  Email Hash:', emailHash);
      console.log('  Role:', role, getRoleName(role));

      const available = await userRegistryContract.isUsernameAvailable(username);
      if (!available) {
        throw new Error('Username is already taken. Please choose another one.');
      }

      const tx = await userRegistryContract.registerUser(
        username,
        emailHash,
        profileImage || '',
        role,
        { gasLimit: 500000 }
      );

      console.log('📝 Registration transaction sent:', tx.hash);
      const receipt = await tx.wait(1);
      console.log('✅ Registration successful!');

      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkRegistration();

      return receipt;
    } catch (err) {
      console.error('❌ Error registering user:', err);
      
      if (err.message.includes('Already registered')) {
        throw new Error('This wallet is already registered');
      } else if (err.message.includes('Username already taken')) {
        throw err;
      } else if (err.message.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (err.message.includes('Username must be 3-20 characters')) {
        throw new Error('Username must be between 3 and 20 characters');
      } else if (err.message.includes('Username can only contain')) {
        throw new Error('Username can only contain lowercase letters, numbers, and underscores');
      } else {
        throw new Error('Failed to register: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [userRegistryContract, checkRegistration]);

  // Check if username is available
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!userRegistryContract) return false;
    
    try {
      return await userRegistryContract.isUsernameAvailable(username);
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  }, [userRegistryContract]);

  // Check if user meets KYC requirement
  const meetsKYCRequirement = useCallback(async (requiredLevel) => {
    if (!userRegistryContract || !account) return false;

    try {
      return await userRegistryContract.meetsKYCRequirement(account, requiredLevel);
    } catch (err) {
      console.error('Error checking KYC requirement:', err);
      return false;
    }
  }, [userRegistryContract, account]);

  // ============ ADMIN FUNCTIONS ============

  // Get all registered users
  const getAllUsers = useCallback(async (offset = 0, limit = 100) => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    try {
      console.log('📋 Fetching users...');
      
      const totalUsers = await userRegistryContract.totalUsers();
      console.log('  Total Users:', Number(totalUsers));

      if (Number(totalUsers) === 0) {
        return [];
      }

      const userAddresses = await userRegistryContract.getUsers(offset, limit);
      console.log('  Fetched addresses:', userAddresses.length);

      const usersData = await Promise.all(
        userAddresses.map(async (address) => {
          try {
            const registered = await userRegistryContract.isRegistered(address);
            if (!registered) return null;

            const profile = await userRegistryContract.getUserProfile(address);
            return {
              walletAddress: profile.walletAddress,
              username: profile.username,
              emailHash: profile.emailHash,
              profileImageHash: profile.profileImageHash,
              kycLevel: Number(profile.kycLevel),
              primaryRole: Number(profile.primaryRole),
              registrationDate: Number(profile.registrationDate) * 1000,
              lastLoginDate: Number(profile.lastLoginDate) * 1000,
              isActive: profile.isActive,
              isBanned: profile.isBanned,
              reputationScore: Number(profile.reputationScore)
            };
          } catch (err) {
            console.error('Error fetching profile for', address, err);
            return null;
          }
        })
      );

      const validUsers = usersData.filter(u => u !== null);
      console.log('✅ Loaded users:', validUsers.length);
      return validUsers;
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      throw new Error('Failed to fetch users: ' + err.message);
    }
  }, [userRegistryContract]);

  // Set KYC level (Admin only)
  const setUserKYCLevel = useCallback(async (userAddress, kycLevel) => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can set KYC levels');
    }

    try {
      console.log('🔐 Setting KYC level for:', userAddress);
      console.log('  New Level:', kycLevel, getKYCLevelName(kycLevel));

      const tx = await userRegistryContract.setKYCLevel(
        userAddress,
        kycLevel,
        { gasLimit: 300000 }
      );

      console.log('📝 Transaction sent:', tx.hash);
      const receipt = await tx.wait(1);
      console.log('✅ KYC level updated!');

      return receipt;
    } catch (err) {
      console.error('❌ Error setting KYC level:', err);
      
      if (err.message.includes('User not registered')) {
        throw new Error('User is not registered');
      } else if (err.message.includes('Ownable: caller is not the owner')) {
        throw new Error('Only contract owner can set KYC levels');
      } else {
        throw new Error('Failed to set KYC level: ' + err.message);
      }
    }
  }, [userRegistryContract, isOwner]);

  // Ban user (Admin only)
  const banUser = useCallback(async (userAddress, reason) => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can ban users');
    }

    try {
      console.log('🚫 Banning user:', userAddress);
      console.log('  Reason:', reason);

      const tx = await userRegistryContract.banUser(
        userAddress,
        reason,
        { gasLimit: 300000 }
      );

      console.log('📝 Transaction sent:', tx.hash);
      const receipt = await tx.wait(1);
      console.log('✅ User banned!');

      return receipt;
    } catch (err) {
      console.error('❌ Error banning user:', err);
      throw new Error('Failed to ban user: ' + err.message);
    }
  }, [userRegistryContract, isOwner]);

  // Unban user (Admin only)
  const unbanUser = useCallback(async (userAddress) => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can unban users');
    }

    try {
      console.log('✅ Unbanning user:', userAddress);

      const tx = await userRegistryContract.unbanUser(
        userAddress,
        { gasLimit: 300000 }
      );

      console.log('📝 Transaction sent:', tx.hash);
      const receipt = await tx.wait(1);
      console.log('✅ User unbanned!');

      return receipt;
    } catch (err) {
      console.error('❌ Error unbanning user:', err);
      throw new Error('Failed to unban user: ' + err.message);
    }
  }, [userRegistryContract, isOwner]);

  // Get platform statistics
  const getStats = useCallback(async () => {
    if (!userRegistryContract) {
      throw new Error('UserRegistry contract not initialized');
    }

    try {
      const stats = await userRegistryContract.getStats();
      return {
        totalUsers: Number(stats.total),
        bannedUsers: Number(stats.banned),
        activeUsers: Number(stats.active)
      };
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      throw new Error('Failed to fetch stats: ' + err.message);
    }
  }, [userRegistryContract]);

  return {
    isRegistered,
    userProfile,
    kycLevel,
    loading,
    error,
    isOwner,
    registerUser,
    checkRegistration,
    checkUsernameAvailability,
    meetsKYCRequirement,
    userRegistryContract,
    // Admin functions
    getAllUsers,
    setUserKYCLevel,
    banUser,
    unbanUser,
    getStats
  };
};

// Helper functions
function getKYCLevelName(level) {
  const levels = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
  return levels[level] || 'UNKNOWN';
}

function getRoleName(role) {
  const roles = ['BACKER', 'CREATOR', 'BOTH'];
  return roles[role] || 'UNKNOWN';
}

// Export KYC levels as constants
export const KYCLevel = {
  NONE: 0,
  BASIC: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

// Export user roles as constants
export const UserRole = {
  BACKER: 0,
  CREATOR: 1,
  BOTH: 2
};