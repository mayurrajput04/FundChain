import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Sepolia network configuration
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal
  const SEPOLIA_CONFIG = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError("MetaMask not installed");
      return null;
    }

    try {
      // First, switch to Sepolia
      await switchToSepolia();
      
      // Then connect wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const web3Account = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(web3Account);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      setError(null);

      return { provider: web3Provider, signer: web3Signer, account: web3Account };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);

    // Clear all auth data
    localStorage.removeItem('fundchain_auth');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_timestamp');
    
    console.log('👋 Disconnected');
  }, []);

  // Check if connected to correct network
  const isCorrectNetwork = useCallback(() => {
    return chainId === 11155111; // Sepolia chain ID
  }, [chainId]);


  // Listen for account changes

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      console.log('🔄 Wallet changed:', accounts[0]);
      
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else {
        // Account changed - reload the page to reset state
        window.location.reload();
      }
    };

    const handleChainChanged = (newChainId) => {
      console.log('🔄 Chain changed:', parseInt(newChainId, 16));
      // Reload to reset state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();

    // Event listeners for account/chain changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
        // Don't reload page, just update state
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet, disconnectWallet]);

  return {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    isCorrectNetwork,
    switchToSepolia
  };
};