import React, { useState, useEffect } from 'react';
import { CheckCircle, Users, TrendingUp, Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useWeb3 } from '../../hooks/useWeb3';

const AdminDashboard = () => {
  const { account } = useWeb3();
  const { campaigns, loading, isAdmin, hardcodedAdminAddress, approveCampaign, refreshCampaigns } = useCampaigns();
  const [approvingCampaign, setApprovingCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  console.log('🔍 AdminDashboard - Account:', account);
  console.log('🔍 AdminDashboard - isAdmin:', isAdmin);
  console.log('🔍 AdminDashboard - adminCheckComplete:', adminCheckComplete);

  // Wait for admin check to complete
  useEffect(() => {
    if (account && hardcodedAdminAddress) {
      const timer = setTimeout(() => {
        setAdminCheckComplete(true);
        console.log('✅ Admin check complete. Final isAdmin value:', isAdmin);
      }, 100); // Small delay to ensure isAdmin is calculated

      return () => clearTimeout(timer);
    }
  }, [account, hardcodedAdminAddress, isAdmin]);

  // Show loading while checking admin status
  if (!adminCheckComplete) {
    return (
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '4rem 1rem', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader2 style={{ 
          width: '4rem', 
          height: '4rem', 
          color: '#7c3aed', 
          margin: '0 auto 1.5rem',
          animation: 'spin 1s linear infinite' 
        }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
          Verifying Admin Access...
        </h2>
        <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          Checking wallet: {account?.slice(0, 10)}...{account?.slice(-8)}
        </p>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Redirect if not admin (ONLY after check is complete)
  if (!isAdmin) {
    console.log('❌ Not admin - redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Admin verified - showing dashboard');

  const pendingCampaigns = campaigns.filter(c => !c.isApproved);
  const activeCampaigns = campaigns.filter(c => c.isApproved && c.isActive);
  const completedCampaigns = campaigns.filter(c => !c.isActive);

const handleApprove = async (campaignAddress, campaignTitle) => {
  setError(null);
  
  // FIRST: Run debug
  console.log('🔍 Running debug before approval...');
//   await debugCampaign(campaignAddress);  
  
  if (!window.confirm(`🔐 ADMIN APPROVAL\n\nCampaign: "${campaignTitle}"\n\nApprove this campaign?`)) {
    return;
  }

  setApprovingCampaign(campaignAddress);
  
  try {
    console.log('🔐 Attempting approval...');
    console.log('  Campaign:', campaignAddress);
    console.log('  Admin account:', account);
    
    const receipt = await approveCampaign(campaignAddress);
    
    console.log('✅ Approval successful!');
    alert(`✅ SUCCESS!\n\nCampaign approved!\n\nTx: ${receipt.hash}`);
    
    await refreshCampaigns();
    
  } catch (err) {
    console.error('❌ Full error object:', err);
    
    let errorMessage = 'Unknown error';
    
    // Parse the error
    if (err.receipt) {
      console.log('📋 Transaction Receipt:', err.receipt);
      errorMessage = `Transaction failed with status: ${err.receipt.status}\n\nThe smart contract rejected the approval.`;
    }
    
    if (err.message) {
      console.log('📋 Error message:', err.message);
      errorMessage = err.message;
    }
    
    // Check for specific errors
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected in MetaMask.';
    } else if (errorMessage.includes('insufficient funds')) {
      errorMessage = 'Insufficient ETH for gas.';
    } else if (errorMessage.includes('execution reverted')) {
      errorMessage = 'Smart contract rejected the transaction.\n\nPossible reasons:\n1. You are not the admin in the smart contract\n2. Campaign is already approved\n3. Contract has a bug\n\nCheck console for debug info.';
    }
    
    setError({ address: campaignAddress, message: errorMessage });
    alert(`❌ APPROVAL FAILED\n\n${errorMessage}\n\nCheck browser console for details.`);
    
  } finally {
    setApprovingCampaign(null);
  }
};

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>{value}</p>
          {description && (
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: '500' }}>{description}</p>
          )}
        </div>
        <div style={{
          padding: '1rem',
          borderRadius: '9999px',
          backgroundColor: color
        }}>
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Shield style={{ width: '2.5rem', height: '2.5rem', color: '#7c3aed' }} />
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Admin Dashboard</h1>
          <span style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '700'
          }}>
            ✓ Verified
          </span>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem', fontFamily: 'monospace' }}>
          🔐 Admin: {account}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard title="Total Campaigns" value={campaigns.length} icon={TrendingUp} color="#3b82f6" />
        <StatCard 
          title="⏳ Pending Approval" 
          value={pendingCampaigns.length} 
          icon={Clock} 
          color="#f59e0b"
          description={pendingCampaigns.length > 0 ? "⚠️ Action required" : "✅ All caught up"}
        />
        <StatCard title="✅ Active" value={activeCampaigns.length} icon={CheckCircle} color="#10b981" />
        <StatCard title="Completed" value={completedCampaigns.length} icon={Users} color="#6b7280" />
      </div>

      {/* Pending Campaigns */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Campaigns Awaiting Approval
          </h2>
          {pendingCampaigns.length > 0 && (
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '700'
            }}>
              {pendingCampaigns.length}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <Loader2 style={{ width: '3rem', height: '3rem', color: '#7c3aed', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading...</p>
          </div>
        ) : pendingCampaigns.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '4rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <CheckCircle style={{ width: '5rem', height: '5rem', color: '#10b981', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>All Caught Up! 🎉</h3>
            <p style={{ color: '#6b7280' }}>No campaigns pending approval</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {pendingCampaigns.map((campaign, index) => (
              <div key={campaign.address} style={{
                padding: '2rem',
                borderBottom: index < pendingCampaigns.length - 1 ? '2px solid #e5e7eb' : 'none',
                backgroundColor: error?.address === campaign.address ? '#fef2f2' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
                      {campaign.title}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>
                        📁 {campaign.category}
                      </span>
                      <span style={{ color: '#1f2937', fontSize: '0.9375rem', padding: '0.5rem 0', fontWeight: '600' }}>
                        🎯 Goal: <strong>{campaign.goal} ETH</strong>
                      </span>
                    </div>
                    
                    <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                      {campaign.description}
                    </p>

                    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                      <div style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                        <strong>Creator:</strong> {campaign.creator}
                      </div>
                      <div style={{ color: '#6b7280' }}>
                        <strong>Contract:</strong> {campaign.address}
                      </div>
                    </div>

                    {error?.address === campaign.address && (
                      <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: '#fee2e2', border: '2px solid #fecaca', borderRadius: '0.75rem', display: 'flex', gap: '1rem' }}>
                        <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626', flexShrink: 0 }} />
                        <div>
                          <p style={{ color: '#dc2626', fontWeight: '700', marginBottom: '0.5rem' }}>❌ Approval Failed</p>
                          <p style={{ color: '#991b1b', fontSize: '0.9375rem', lineHeight: '1.6' }}>{error.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleApprove(campaign.address, campaign.title)}
                    disabled={approvingCampaign === campaign.address}
                    style={{
                      backgroundColor: approvingCampaign === campaign.address ? '#9ca3af' : '#10b981',
                      color: 'white',
                      padding: '1.5rem 2rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: approvingCampaign === campaign.address ? 'not-allowed' : 'pointer',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      minWidth: '180px',
                      boxShadow: approvingCampaign === campaign.address ? 'none' : '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (approvingCampaign !== campaign.address) {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (approvingCampaign !== campaign.address) {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    {approvingCampaign === campaign.address ? (
                      <>
                        <Loader2 style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle style={{ width: '2rem', height: '2rem' }} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;