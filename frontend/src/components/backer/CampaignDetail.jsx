import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCampaigns } from '../../hooks/useCampaigns';

const CampaignDetail = () => {
  const { address } = useParams();
  const { account, isConnected } = useWeb3();
  const { campaigns, contributeToCampaign } = useCampaigns();
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  // Find the campaign by address
const campaign = campaigns.find(c => c.address === address);
const isCreator = account && campaign?.creator.toLowerCase() === account.toLowerCase();

  if (!campaign) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
          Campaign Not Found
        </h1>
        <p style={{ color: '#6b7280' }}>The campaign you're looking for doesn't exist.</p>
      </div>
    );
  }

  const progress = (parseFloat(campaign.totalRaised) / parseFloat(campaign.goal)) * 100;
  const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  const isCompleted = progress >= 100;
  const isExpired = daysLeft <= 0 && !isCompleted;

  const handleContribution = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    setIsContributing(true);
    try {
      await contributeToCampaign(campaign.address, contributionAmount);
      setContributionAmount('');
      alert('Contribution successful!');
    } catch (error) {
      alert('Contribution failed: ' + error.message);
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: '2rem'
      }}>
        {/* Left Column - Campaign Info */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
              {campaign.title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', lineHeight: '1.75' }}>
              {campaign.description}
            </p>
          </div>

          {/* Campaign Stats */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Campaign Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Creator:</span>
                <span style={{ fontWeight: '600' }}>
                  {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-6)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Category:</span>
                <span style={{ fontWeight: '600' }}>{campaign.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Status:</span>
                <span style={{
                  fontWeight: '600',
                  color: !campaign.isApproved ? '#f59e0b' : 
                         isCompleted ? '#10b981' : 
                         isExpired ? '#ef4444' : '#3b82f6'
                }}>
                  {!campaign.isApproved ? 'Pending Approval' : 
                   isCompleted ? 'Completed' :
                   isExpired ? 'Expired' : 'Active'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Backers:</span>
                <span style={{ fontWeight: '600' }}>{campaign.backers}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Days Left:</span>
                <span style={{ fontWeight: '600' }}>{daysLeft > 0 ? daysLeft : 'Ended'}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '1.5rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  {campaign.totalRaised} ETH
                </span>
                <span style={{ color: '#6b7280' }}>Goal: {campaign.goal} ETH</span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                height: '0.75rem'
              }}>
                <div 
                  style={{
                    height: '0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                    transition: 'all 0.3s',
                    width: `${Math.min(progress, 100)}%`
                  }}
                ></div>
              </div>
              <div style={{
                textAlign: 'right',
                color: '#6b7280',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {Math.round(progress)}% funded
              </div>
            </div>
          </div>
        </div>
{/* Right Column - Contribution */}
<div>
  <div style={{
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '1.5rem'
  }}>
    <h3 style={{ 
      fontSize: '1.5rem', 
      fontWeight: '600', 
      color: '#059669',
      marginBottom: '1rem'
    }}>
      Support This Campaign
    </h3>

    {/* ✅ FIXED: Show message if user is creator */}
    {isCreator ? (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        color: '#92400e',
        border: '1px solid #f59e0b'
      }}>
        <strong>ℹ️ This is your campaign</strong>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          You cannot contribute to your own campaign. Share it with others to get backers!
        </p>
      </div>
    ) : !isConnected ? (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        color: '#92400e'
      }}>
        Please connect your wallet to contribute
      </div>
    ) : !campaign.isApproved ? (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        color: '#92400e'
      }}>
        This campaign is pending admin approval
      </div>
    ) : isCompleted ? (
      <div style={{
        padding: '1rem',
        backgroundColor: '#d1fae5',
        borderRadius: '0.5rem',
        color: '#065f46'
      }}>
        Campaign goal reached! Thank you for your support.
      </div>
    ) : isExpired ? (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fee2e2',
        borderRadius: '0.5rem',
        color: '#991b1b'
      }}>
        Campaign has ended
      </div>
    ) : (
      <>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '0.5rem' 
          }}>
            Contribution Amount (ETH)
          </label>
          <input
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
            placeholder="0.1"
            step="0.01"
            min="0.001"
          />
        </div>

        <button
          onClick={handleContribution}
          disabled={isContributing || !contributionAmount}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isContributing || !contributionAmount ? 'not-allowed' : 'pointer',
            opacity: isContributing || !contributionAmount ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isContributing ? 'Processing...' : 'Contribute Now'}
        </button>
      </>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default CampaignDetail;