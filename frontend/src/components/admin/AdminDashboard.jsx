import React, { useState, useEffect } from 'react';
import { Shield, Users, CheckCircle, Clock } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useUserRegistry } from '../../hooks/useUserRegistry';
import UserManagement from './UserManagement';

import { useNavigate } from 'react-router-dom';
import contractConfig from '../../config/contracts';

const AdminDashboard = () => {
  const { campaigns, approveCampaign, loading, isAdmin, hardcodedAdminAddress } = useCampaigns();
  const { isOwner } = useUserRegistry();
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'users'
  const [approving, setApproving] = useState(null);

  const { account } = useWeb3();
  const navigate = useNavigate();

  const pendingCampaigns = campaigns.filter(c => !c.isApproved);
  const approvedCampaigns = campaigns.filter(c => c.isApproved);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('admin_authenticated');
      const timestamp = localStorage.getItem('admin_timestamp');
      
      // Check if session expired (24 hours)
      if (!isAuth || !timestamp || Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_timestamp');
        navigate('/admin-secret-login');
        return;
      }

      // Check if wallet is still admin
      if (account?.toLowerCase() !== contractConfig.admin.toLowerCase()) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_timestamp');
        navigate('/admin-secret-login');
        return;
      }
    };

    checkAuth();
  }, [account, navigate]);

  const handleApprove = async (campaignAddress) => {
    setApproving(campaignAddress);
    try {
      await approveCampaign(campaignAddress);
      alert('✅ Campaign approved successfully!');
    } catch (error) {
      console.error('Approval error:', error);
      alert('Error: ' + error.message);
    } finally {
      setApproving(null);
    }
  };

  // Check if user has any admin permissions
  const hasAdminAccess = isAdmin || isOwner;

  if (!hasAdminAccess) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Shield size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h1>Access Denied</h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          This page is restricted to administrators only.
        </p>
        <p style={{ fontSize: '14px', color: '#9ca3af', fontFamily: 'monospace' }}>
          Hardcoded Admin: {hardcodedAdminAddress}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={32} />
          Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>Manage campaigns and users</p>
      </div>

      {/* Admin Info Banner */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a' }}>
          <CheckCircle size={20} />
          <div>
            <strong>Admin Access Granted</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              {isAdmin && '✅ CampaignFactory Admin'}
              {isAdmin && isOwner && ' • '}
              {isOwner && '✅ UserRegistry Owner'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('campaigns')}
            style={{
              padding: '15px 30px',
              border: 'none',
              borderBottom: activeTab === 'campaigns' ? '3px solid #4f46e5' : '3px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'campaigns' ? 'bold' : 'normal',
              color: activeTab === 'campaigns' ? '#4f46e5' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <Clock size={20} />
            Campaign Approvals
            {pendingCampaigns.length > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {pendingCampaigns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '15px 30px',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'users' ? 'bold' : 'normal',
              color: activeTab === 'users' ? '#4f46e5' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <Users size={20} />
            User Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'campaigns' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
              <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '5px' }}>Pending Approval</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#b45309' }}>{pendingCampaigns.length}</div>
            </div>
            <div style={{ backgroundColor: '#d1fae5', padding: '20px', borderRadius: '8px', border: '1px solid #34d399' }}>
              <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '5px' }}>Approved</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#047857' }}>{approvedCampaigns.length}</div>
            </div>
            <div style={{ backgroundColor: '#e0e7ff', padding: '20px', borderRadius: '8px', border: '1px solid #818cf8' }}>
              <div style={{ fontSize: '14px', color: '#3730a3', marginBottom: '5px' }}>Total Campaigns</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4338ca' }}>{campaigns.length}</div>
            </div>
          </div>

          {/* Pending Campaigns */}
          <h2 style={{ marginBottom: '20px' }}>Pending Campaigns</h2>
          {loading ? (
            <p style={{ color: '#6b7280' }}>Loading campaigns...</p>
          ) : pendingCampaigns.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: '10px' }} />
              <p style={{ color: '#6b7280' }}>No pending campaigns. All caught up! 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {pendingCampaigns.map((campaign) => (
                <div
                  key={campaign.address}
                  style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, marginBottom: '10px' }}>{campaign.title}</h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
                        <strong>Category:</strong> {campaign.category}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
                        <strong>Goal:</strong> {campaign.goal} ETH
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
                        <strong>Creator:</strong> <span style={{ fontFamily: 'monospace' }}>{campaign.creator}</span>
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
                        <strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '10px 0 0 0' }}>
                        {campaign.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApprove(campaign.address)}
                      disabled={approving === campaign.address}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: approving === campaign.address ? '#9ca3af' : '#10b981',
                        color: 'white',
                        cursor: approving === campaign.address ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginLeft: '20px'
                      }}
                    >
                      {approving === campaign.address ? 'Approving...' : '✅ Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Campaigns (collapsed view) */}
          {approvedCampaigns.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ marginBottom: '20px' }}>Approved Campaigns ({approvedCampaigns.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {approvedCampaigns.map((campaign) => (
                  <div
                    key={campaign.address}
                    style={{
                      padding: '15px',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4'
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{campaign.title}</h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0' }}>
                      {campaign.goal} ETH • {campaign.category}
                    </p>
                    <div style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      ✅ APPROVED
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagement />
      )}
    </div>
  );
};

export default AdminDashboard;