import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, AlertCircle } from 'lucide-react';

import { Search, Filter, Grid, List, Plus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCampaigns } from '../../hooks/useCampaigns';
import { useUserRegistry } from '../../hooks/useUserRegistry';
import { useWeb3 } from '../../hooks/useWeb3';
import CampaignCard from '../common/CampaignCard';
import RegistrationModal from '../common/RegistrationModal';

import LoginGate from '../common/LoginGate';

const BackerDashboard = () => {
  const { campaigns, loading } = useCampaigns();
  const { account } = useWeb3();
  const { isRegistered, userProfile, checkRegistration } = useUserRegistry();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    if (account) {
      checkRegistration();
    }
  }, [account, checkRegistration]);

  // Find campaigns the user has contributed to
  const supportedCampaigns = campaigns.filter(campaign => 
    // This is a placeholder - we'll need to check actual contributions
    // For now, we'll just show approved campaigns
    campaign.isApproved
  );

  return (
    <LoginGate requireRegistration={true}>
          <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>Backer Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Support amazing projects and track your contributions</p>
      </div>

      {/* Registration Status */}
      {!isRegistered ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
            <AlertCircle size={24} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Registration Required</h3>
              <p style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '14px' }}>
                To contribute to campaigns and track your support, you need to register first.
                This creates your on-chain profile and enables you to participate in the community.
              </p>
              <button
                onClick={() => setShowRegistrationModal(true)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Heart size={24} color="#047857" fill="#047857" />
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#047857' }}>
                Welcome back, @{userProfile?.username}!
              </h3>
              <p style={{ margin: 0, color: '#065f46', fontSize: '14px' }}>
                Account Status: Active • Reputation: {userProfile?.reputationScore || 0}/1000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Heart size={20} color="#ef4444" />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Campaigns Supported</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '5px 0 0 0' }}>
            Start supporting projects today
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <TrendingUp size={20} color="#10b981" />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Contributed</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0 ETH</div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '5px 0 0 0' }}>
            Make your first contribution
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <AlertCircle size={20} color="#6b7280" />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Available Campaigns</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {campaigns.filter(c => c.isApproved).length}
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '5px 0 0 0' }}>
            Browse and support
          </p>
        </div>
      </div>

      {/* Discover Campaigns Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Discover Campaigns</h2>
          <a 
            href="/discover" 
            style={{ 
              color: '#4f46e5', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All →
          </a>
        </div>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading campaigns...</p>
        ) : supportedCampaigns.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <TrendingUp size={48} color="#9ca3af" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No active campaigns yet</h3>
            <p style={{ color: '#9ca3af' }}>
              Check back soon for exciting projects to support!
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {supportedCampaigns.slice(0, 6).map(campaign => (
              <CampaignCard 
                key={campaign.address} 
                campaign={campaign}
                isRegistered={isRegistered}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <RegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setShowRegistrationModal(false);
            checkRegistration();
          }}
        />
      )}
    </div>
    </LoginGate>


  );
};

export default BackerDashboard;