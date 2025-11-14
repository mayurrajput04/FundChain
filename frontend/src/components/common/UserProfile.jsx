import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Calendar, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useUserRegistry, KYCLevel, UserRole } from '../../hooks/useUserRegistry';
import { useToast } from '../../contexts/ToastContext';  // ✅ FIXED PATH

const UserProfile = () => {
  const { account } = useWeb3();
  const { userProfile, isRegistered, loading } = useUserRegistry();
  const { showToast } = useToast();

  // ✅ FIXED: Define helper functions outside component to avoid re-creation
  const getKYCLevelName = (level) => {
    const levels = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
    return levels[Number(level)] || 'UNKNOWN';
  };

  const getKYCLevelColor = (level) => {
    const colors = ['#9ca3af', '#3b82f6', '#8b5cf6', '#10b981'];
    return colors[Number(level)] || '#9ca3af';
  };

  const getRoleName = (role) => {
    const roles = ['BACKER', 'CREATOR', 'BOTH'];
    return roles[Number(role)] || 'UNKNOWN';
  };

  const getKYCBadge = (level) => {
    const badges = [
      { icon: '⚪', text: 'Not Verified', color: '#9ca3af' },
      { icon: '🔵', text: 'Basic Verified', color: '#3b82f6' },
      { icon: '🟣', text: 'Intermediate', color: '#8b5cf6' },
      { icon: '🟢', text: 'Advanced', color: '#10b981' }
    ];
    return badges[Number(level)] || badges[0];
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading profile...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isRegistered || !userProfile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <User size={64} color="#9ca3af" style={{ marginBottom: '20px' }} />
        <h2>No Profile Found</h2>
        <p style={{ color: '#6b7280' }}>Please register to create your profile.</p>
      </div>
    );
  }

  const kycBadge = getKYCBadge(userProfile.kycLevel);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>My Profile</h1>
        <p style={{ color: '#6b7280' }}>Manage your account information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column - Profile Card */}
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '?'}
            </div>

            {/* Username */}
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>
              @{userProfile.username || 'unknown'}
            </h2>

            {/* Role Badge */}
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {getRoleName(userProfile.primaryRole)}
            </div>

            {/* Wallet Address */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              marginBottom: '20px',
              wordBreak: 'break-all'
            }}>
              {account}
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginTop: '20px'
            }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {userProfile.reputationScore || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Reputation
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: userProfile.isBanned ? '#ef4444' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {userProfile.isBanned ? (
                    <XCircle size={24} />
                  ) : (
                    <CheckCircle size={24} />
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  {userProfile.isBanned ? 'Banned' : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KYC Status Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>KYC Verification Status</h3>
              <div style={{
                padding: '8px 16px',
                backgroundColor: kycBadge.color + '20',
                color: kycBadge.color,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{kycBadge.icon}</span>
                {kycBadge.text}
              </div>
            </div>

            {/* KYC Progress */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                {['NONE', 'BASIC', 'INTER', 'ADV'].map((level, index) => {
                  const currentLevel = Number(userProfile.kycLevel);
                  const isCompleted = index <= currentLevel;
                  
                  return (
                    <div key={level} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? getKYCLevelColor(index) : '#e5e7eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontWeight: 'bold'
                      }}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{level}</div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(Number(userProfile.kycLevel) / 3) * 100}%`,
                  height: '100%',
                  backgroundColor: getKYCLevelColor(userProfile.kycLevel),
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* KYC Info */}
            <div style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {Number(userProfile.kycLevel) === KYCLevel.NONE && (
                <>
                  <strong>Not Verified</strong>
                  <p style={{ margin: '8px 0 0 0' }}>
                    You need at least BASIC verification to create campaigns. Contact admin to upgrade.
                  </p>
                </>
              )}
              {Number(userProfile.kycLevel) === KYCLevel.BASIC && (
                <>
                  <strong>Basic Verification ✓</strong>
                  <p style={{ margin: '8px 0 0 0' }}>
                    You can create and back campaigns. Upgrade to INTERMEDIATE for higher limits.
                  </p>
                </>
              )}
              {Number(userProfile.kycLevel) === KYCLevel.INTERMEDIATE && (
                <>
                  <strong>Intermediate Verification ✓</strong>
                  <p style={{ margin: '8px 0 0 0' }}>
                    Enhanced privileges. Upgrade to ADVANCED for maximum benefits.
                  </p>
                </>
              )}
              {Number(userProfile.kycLevel) === KYCLevel.ADVANCED && (
                <>
                  <strong>Advanced Verification ✓</strong>
                  <p style={{ margin: '8px 0 0 0' }}>
                    Maximum privileges. You have full access to all platform features.
                  </p>
                </>
              )}
            </div>

            {Number(userProfile.kycLevel) < KYCLevel.ADVANCED && (
              <button
                onClick={() => showToast('KYC upgrade requests coming soon! Contact admin for now.', 'info')}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
              >
                Request KYC Upgrade
              </button>
            )}
          </div>

          {/* Account Details Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Account Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="#6b7280" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Member Since</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {userProfile.registrationDate 
                      ? new Date(userProfile.registrationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="#6b7280" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Last Active</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {userProfile.lastLoginDate 
                      ? new Date(userProfile.lastLoginDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="#6b7280" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Email Hash</div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontFamily: 'monospace',
                    color: '#4f46e5',
                    wordBreak: 'break-all'
                  }}>
                    {userProfile.emailHash 
                      ? `${userProfile.emailHash.slice(0, 20)}...`
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;