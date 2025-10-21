import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { useUserRegistry } from './useUserRegistry';

const AUTH_STORAGE_KEY = 'fundchain_auth';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useAuth = () => {
  const { account, isConnected } = useWeb3();
  const { isRegistered, userProfile } = useUserRegistry();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          
          // Check if session is expired
          if (Date.now() - session.timestamp < SESSION_DURATION) {
            // Check if wallet address matches
            if (session.address.toLowerCase() === account?.toLowerCase()) {
              setSessionData(session);
              setIsAuthenticated(true);
              console.log('✅ Session restored:', session.username);
            } else {
              // Wallet changed - clear session
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          } else {
            // Session expired
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setAuthLoading(false);
      }
    };

    if (account) {
      loadSession();
    } else {
      setIsAuthenticated(false);
      setSessionData(null);
      setAuthLoading(false);
    }
  }, [account]);

  // Auto-login if registered and connected
  useEffect(() => {
    const autoLogin = async () => {
      if (isConnected && account && isRegistered && !isAuthenticated && userProfile) {
        await createSession(userProfile);
      }
    };

    autoLogin();
  }, [isConnected, account, isRegistered, isAuthenticated, userProfile]);

  // Create new session
  const createSession = useCallback(async (profile) => {
    try {
      const session = {
        address: account,
        username: profile.username,
        role: profile.primaryRole,
        kycLevel: profile.kycLevel,
        timestamp: Date.now()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setSessionData(session);
      setIsAuthenticated(true);
      
      console.log('✅ Session created for:', profile.username);
      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      return false;
    }
  }, [account]);

  // Login (after registration)
  const login = useCallback(async () => {
    if (!isRegistered || !userProfile) {
      throw new Error('User must be registered to login');
    }

    return await createSession(userProfile);
  }, [isRegistered, userProfile, createSession]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSessionData(null);
    setIsAuthenticated(false);
    console.log('👋 Logged out');
  }, []);

  // Get user role
  const getUserRole = useCallback(() => {
    if (!sessionData) return null;
    
    const roles = ['BACKER', 'CREATOR', 'BOTH'];
    return roles[sessionData.role] || null;
  }, [sessionData]);

  return {
    isAuthenticated,
    authLoading,
    sessionData,
    login,
    logout,
    getUserRole,
    createSession
  };
};