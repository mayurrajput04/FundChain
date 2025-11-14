import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, Users, Eye, Shield, AlertTriangle, LogOut, User, Search, PlusCircle, Heart} from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useWeb3 } from '../../hooks/useWeb3';
import WalletConnect from './WalletConnect';

const Header = ({ account, onDisconnect }) => {
  const { isAdmin, hardcodedAdminAddress, contractAdminAddress, campaigns } = useCampaigns();
  const navigate = useNavigate();

// ✅ GOOD - Just use it normally
const location = useLocation();
  
  const userCampaignsCount = useMemo(() => {
    return campaigns.filter(
      campaign => campaign.creator.toLowerCase() === account.toLowerCase()
    ).length;
  }, [campaigns, account]);

  const isCreator = userCampaignsCount > 0;

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  console.log('🔍 Header - Current account:', account);
  console.log('🔍 Header - Is admin?', isAdmin);
  console.log('🔍 Header - Current path:', location.pathname);

  return (
    <>
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 999,
        backdropFilter: 'saturate(180%) blur(5px)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4rem'
          }}>
            {/* Logo and Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}>
                <Wallet style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} />
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>FundChain</span>
              </Link>
              
              <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to="/"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    ...(location.pathname === '/' ? {
                      backgroundColor: '#e0e7ff',
                      color: '#4f46e5'
                    } : {
                      color: '#6b7280'
                    })
                  }}
                >
                  <Eye style={{ width: '1rem', height: '1rem' }} />
                  Discover
                </Link>

                {!isAdmin && (
                  <Link
                    to="/creator"
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      ...(location.pathname === '/creator' ? {
                        backgroundColor: '#dbeafe',
                        color: '#2563eb'
                      } : {
                        color: '#6b7280'
                      })
                    }}
                  >
                    <Users style={{ width: '1rem', height: '1rem' }} />
                    My Campaigns
                    {userCampaignsCount > 0 && (
                      <span style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {userCampaignsCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* ADMIN PANEL LINK - ALWAYS SHOW IF ADMIN */}
      
{isAdmin && (
  <Link
    to="/admin"
    style={{
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      cursor: 'pointer',
      ...(location.pathname === '/admin' ? {
        backgroundColor: '#f3e8ff',
        color: '#7c3aed'
      } : {
        color: '#6b7280'
      })
    }}
  >
    <Shield size={20} />
    Admin Panel
  </Link>
)}
              </nav>
            </div>

            {/* User Info */}
            {/* User Info */}
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  {/* Role Badge */}
  {isAdmin ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#f3e8ff',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '2px solid #7c3aed'
    }}>
      <Shield style={{ width: '1rem', height: '1rem', color: '#7c3aed' }} />
      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#7c3aed' }}>ADMIN</span>
      <span style={{
        fontSize: '0.75rem',
        backgroundColor: '#c084fc',
        color: 'white',
        padding: '0.125rem 0.375rem',
        borderRadius: '9999px',
        fontWeight: '600'
      }}>
        ✓
      </span>
    </div>
  ) : isCreator ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#dbeafe',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #bfdbfe'
    }}>
      <Users style={{ width: '1rem', height: '1rem', color: '#2563eb' }} />
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2563eb' }}>Creator</span>
    </div>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#f3f4f6',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem'
    }}>
      <Eye style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Backer</span>
    </div>
  )}
  
  {/* Wallet Address */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#e0e7ff',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem'
  }}>
    <Wallet style={{ width: '1rem', height: '1rem', color: '#4f46e5' }} />
    <span style={{
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4f46e5',
      fontFamily: 'monospace'
    }}>
      {formatAddress(account)}
    </span>
  </div>

  {/* Profile Link - ONLY ONE */}
  <Link
    to="/profile"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      border: location.pathname === '/profile' ? '2px solid #4f46e5' : '1px solid #e5e7eb',
      backgroundColor: location.pathname === '/profile' ? '#eef2ff' : 'white',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      if (location.pathname !== '/profile') {
        e.currentTarget.style.backgroundColor = '#f3f4f6';
      }
    }}
    onMouseLeave={(e) => {
      if (location.pathname !== '/profile') {
        e.currentTarget.style.backgroundColor = 'white';
      }
    }}
  >
    <User size={16} color={location.pathname === '/profile' ? '#4f46e5' : '#6b7280'} />
    <span style={{ 
      fontSize: '0.875rem', 
      fontWeight: '500', 
      color: location.pathname === '/profile' ? '#4f46e5' : '#374151' 
    }}>
      Profile
    </span>
  </Link>
  
  {/* Disconnect Button */}
  <button
    onClick={onDisconnect}
    style={{
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      color: 'white',
      backgroundColor: '#ef4444',
      fontWeight: '500',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
  >
    Disconnect
  </button>
</div>
            </div>
          </div>
      </header>

      {/* Admin Warning Banner */}
      {isAdmin && (
        <div style={{
          backgroundColor: '#7c3aed',
          color: 'white',
          padding: '0.75rem 1rem'
        }}>
          <div style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Shield style={{ width: '1.25rem', height: '1.25rem' }} />
            <p style={{
              fontSize: '0.875rem',
              margin: 0,
              fontWeight: '600'
            }}>
              🔒 ADMIN MODE ACTIVE - Logged in as: {formatAddress(account)}
            </p>
          </div>
        </div>
      )}

      {/* Contract Admin Mismatch Warning */}
      {contractAdminAddress && hardcodedAdminAddress && 
       contractAdminAddress.toLowerCase() !== hardcodedAdminAddress.toLowerCase() && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderBottom: '1px solid #fde68a',
          padding: '0.75rem 1rem'
        }}>
          <div style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#92400e', marginTop: '0.125rem' }} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#92400e',
                margin: 0,
                fontWeight: '600'
              }}>
                ⚠️ Admin Address Mismatch
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: '#92400e',
                margin: '0.25rem 0 0 0',
                fontFamily: 'monospace'
              }}>
                Frontend: {formatAddress(hardcodedAdminAddress)} | 
                Contract: {formatAddress(contractAdminAddress)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;