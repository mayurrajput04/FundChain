import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCampaigns } from '../../hooks/useCampaigns';
import CampaignWizard from './CampaignWizard';
import CampaignCard from '../common/CampaignCard';
import {UserRole, KYCLevel, useUserRegistry} from '../../hooks/useUserRegistry';
import LoginGate from '../common/LoginGate';
import {useToast, ToastProvider} from '../../contexts/ToastContext';

const CreatorDashboard = () => {
  const { account } = useWeb3();
  const { campaigns, loading } = useCampaigns();
  const { userProfile, isRegistered } = useUserRegistry();  // ✅ ADD isRegistered, userProfile
  const { showToast } = useToast();  // ✅ ADD this
  const [showWizard, setShowWizard] = useState(false);
  

  // ✅ ADD: Check if this is a new user (just registered)
  useEffect(() => {
    if (isRegistered && userProfile) {
      const registrationDate = new Date(userProfile.registrationDate);
      const now = new Date();
      const hoursSinceRegistration = (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60);
      
      // If registered less than 1 hour ago, show welcome message
      if (hoursSinceRegistration < 1) {
        const hasShownWelcome = localStorage.getItem(`welcome_shown_${account}`);
        if (!hasShownWelcome) {
          setTimeout(() => {
            showToast(`👋 Welcome @${userProfile.username}! Ready to create your first campaign?`, 'success', 7000);
            localStorage.setItem(`welcome_shown_${account}`, 'true');
          }, 1000);
        }
      }
    }
  }, [isRegistered, userProfile, account, showToast]);


  // FIXED: Only show campaigns created by THIS user (not admin view)
  const userCampaigns = useMemo(() => {
    return campaigns.filter(campaign => 
      campaign.creator.toLowerCase() === account?.toLowerCase()
    );
  }, [campaigns, account]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    const active = userCampaigns.filter(c => c.isActive && c.isApproved).length;
    const pending = userCampaigns.filter(c => !c.isApproved).length;
    const completed = userCampaigns.filter(c => !c.isActive).length;
    
    setStats({
      total: userCampaigns.length,
      active,
      pending,
      completed
    });
  }, [userCampaigns]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>{title}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginTop: '0.25rem' }}>{value}</p>
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '9999px',
          backgroundColor: color
        }}>
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
        </div>
      </div>
    </div>
  );

  return (
    <LoginGate requireRegistration={true}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937' }}>
            My Campaigns
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Manage your fundraising campaigns
          </p>
        </div>
        <button
  onClick={() => {
    // Check KYC level before opening wizard
    if (userProfile && userProfile.kycLevel < 1) {
      showToast('⚠️ You need at least BASIC KYC verification to create campaigns. Please contact admin.', 'warning', 6000);
    } else {
      setShowWizard(true);
    }
  }}
  style={{
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s'
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
  onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
>
  <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
  <span>Create Campaign</span>
</button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Campaigns"
          value={stats.total}
          icon={TrendingUp}
          color="#3b82f6"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          color="#10b981"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={XCircle}
          color="#6b7280"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ 
            display: 'inline-block',
            width: '2rem',
            height: '2rem',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading your campaigns...</p>
        </div>
      )}

      {/* Campaigns Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {userCampaigns.map((campaign) => (
            <CampaignCard key={campaign.address} campaign={campaign} view="creator" />
          ))}
          
          {userCampaigns.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb'
              }}>
                <TrendingUp style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  No campaigns yet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Create your first fundraising campaign to get started
                </p>
                <button
                  onClick={() => setShowWizard(true)}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaign Creation Wizard */}
      {showWizard && (
        <CampaignWizard 
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false);
          }}
        />
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
    </LoginGate>


  );
};

export default CreatorDashboard;