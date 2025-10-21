import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useUserRegistry, KYCLevel } from '../../hooks/useUserRegistry';
import { ethers } from 'ethers';
import contractConfig from '../../config/contracts';

const CampaignPreflightCheck = ({ onPassed, onFailed }) => {
  const { account, signer, chainId, isCorrectNetwork } = useWeb3();
  const { isRegistered, kycLevel, userProfile, loading: userLoading } = useUserRegistry();
  
  const [checks, setChecks] = useState({
    network: { status: 'pending', message: '' },
    wallet: { status: 'pending', message: '' },
    registration: { status: 'pending', message: '' },
    kycLevel: { status: 'pending', message: '' },
    notBanned: { status: 'pending', message: '' },
    contractConfig: { status: 'pending', message: '' }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    runPreflightChecks();
  }, [account, signer, chainId, isRegistered, kycLevel, userProfile]);

  const runPreflightChecks = async () => {
    setChecking(true);
    const newChecks = { ...checks };

    // Check 1: Network
    if (isCorrectNetwork()) {
      newChecks.network = { status: 'pass', message: `Connected to Sepolia (${chainId})` };
    } else {
      newChecks.network = { status: 'fail', message: `Wrong network (${chainId}). Please switch to Sepolia (11155111)` };
    }

    // Check 2: Wallet
    if (account && signer) {
      newChecks.wallet = { status: 'pass', message: `Wallet connected: ${account.slice(0, 6)}...${account.slice(-4)}` };
    } else {
      newChecks.wallet = { status: 'fail', message: 'Wallet not connected' };
    }

    // Check 3: Contract Configuration
    if (contractConfig?.addresses?.campaignFactory && contractConfig?.addresses?.userRegistry) {
      newChecks.contractConfig = { 
        status: 'pass', 
        message: `Factory: ${contractConfig.addresses.campaignFactory.slice(0, 6)}..., Registry: ${contractConfig.addresses.userRegistry.slice(0, 6)}...` 
      };
    } else {
      newChecks.contractConfig = { 
        status: 'fail', 
        message: 'Contract addresses not configured. Run: npm run update-addresses' 
      };
    }

    // Wait for user data to load
    if (userLoading) {
      newChecks.registration = { status: 'pending', message: 'Checking registration...' };
      newChecks.kycLevel = { status: 'pending', message: 'Checking KYC level...' };
      newChecks.notBanned = { status: 'pending', message: 'Checking ban status...' };
      setChecks(newChecks);
      return;
    }

    // Check 4: Registration
    if (isRegistered) {
      newChecks.registration = { 
        status: 'pass', 
        message: `Registered as @${userProfile?.username || 'unknown'}` 
      };
    } else {
      newChecks.registration = { 
        status: 'fail', 
        message: 'Not registered. You must register before creating campaigns.' 
      };
    }

    // Check 5: KYC Level
    if (isRegistered) {
      if (kycLevel >= KYCLevel.BASIC) {
        newChecks.kycLevel = { 
          status: 'pass', 
          message: `KYC Level: ${getKYCLevelName(kycLevel)} (sufficient)` 
        };
      } else {
        newChecks.kycLevel = { 
          status: 'fail', 
          message: `KYC Level: ${getKYCLevelName(kycLevel)}. You need at least BASIC level. Contact admin to upgrade.` 
        };
      }
    } else {
      newChecks.kycLevel = { 
        status: 'pending', 
        message: 'Register first to check KYC level' 
      };
    }

    // Check 6: Not Banned
    if (isRegistered) {
      if (!userProfile?.isBanned) {
        newChecks.notBanned = { 
          status: 'pass', 
          message: 'Account is active' 
        };
      } else {
        newChecks.notBanned = { 
          status: 'fail', 
          message: 'Your account is banned. Contact admin.' 
        };
      }
    } else {
      newChecks.notBanned = { 
        status: 'pending', 
        message: 'Register first to check ban status' 
      };
    }

    setChecks(newChecks);
    setChecking(false);

    // Determine if all checks passed
    const allPassed = Object.values(newChecks).every(check => check.status === 'pass');
    if (allPassed) {
      onPassed?.();
    } else {
      onFailed?.();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={20} color="#10b981" />;
      case 'fail':
        return <XCircle size={20} color="#ef4444" />;
      case 'pending':
      default:
        return <Loader size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return '#d1fae5';
      case 'fail':
        return '#fee2e2';
      case 'pending':
      default:
        return '#f3f4f6';
    }
  };

  const allPassed = Object.values(checks).every(check => check.status === 'pass');
  const anyFailed = Object.values(checks).some(check => check.status === 'fail');

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={24} color="#6b7280" />
        Pre-flight Checks
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(checks).map(([key, check]) => (
          <div
            key={key}
            style={{
              padding: '12px',
              backgroundColor: getStatusColor(check.status),
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {getStatusIcon(check.status)}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', fontSize: '14px', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: allPassed ? '#d1fae5' : anyFailed ? '#fee2e2' : '#fef3c7',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        {checking ? (
          <div style={{ color: '#6b7280' }}>Running checks...</div>
        ) : allPassed ? (
          <div style={{ color: '#047857', fontWeight: 'bold' }}>
            ✅ All checks passed! You can create campaigns.
          </div>
        ) : anyFailed ? (
          <div style={{ color: '#991b1b', fontWeight: 'bold' }}>
            ❌ Some checks failed. Please resolve the issues above.
          </div>
        ) : (
          <div style={{ color: '#92400e', fontWeight: 'bold' }}>
            ⏳ Waiting for checks to complete...
          </div>
        )}
      </div>

      {/* Action Button */}
      {!allPassed && !checking && (
        <button
          onClick={runPreflightChecks}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#4f46e5',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔄 Re-run Checks
        </button>
      )}
    </div>
  );
};

function getKYCLevelName(level) {
  const levels = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
  return levels[level] || 'UNKNOWN';
}

export default CampaignPreflightCheck;