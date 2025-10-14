import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';

const CampaignCard = ({ campaign, view = 'grid' }) => {
  const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100;
  const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  const isCompleted = progress >= 100;
  const isExpired = daysLeft <= 0 && !isCompleted;

  const formatAddress = (addr) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getStatusBadge = () => {
    if (!campaign.isApproved) {
      return (
        <span style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontSize: '0.75rem',
          fontWeight: '500',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <AlertCircle style={{ width: '0.75rem', height: '0.75rem' }} />
          Pending
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          fontSize: '0.75rem',
          fontWeight: '500',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} />
          Completed
        </span>
      );
    }
    if (isExpired) {
      return (
        <span style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          fontSize: '0.75rem',
          fontWeight: '500',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem'
        }}>
          Expired
        </span>
      );
    }
    return (
      <span style={{
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        fontSize: '0.75rem',
        fontWeight: '500',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem'
      }}>
        {campaign.category}
      </span>
    );
  };

  if (view === 'list') {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        padding: '1.5rem',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
      onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                {campaign.title}
              </h3>
              {getStatusBadge()}
            </div>
            <p style={{
              color: '#6b7280',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{campaign.description}</p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target style={{ width: '1rem', height: '1rem' }} />
                <span>{campaign.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users style={{ width: '1rem', height: '1rem' }} />
                <span>{campaign.backers} backers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock style={{ width: '1rem', height: '1rem' }} />
                <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                <span>{campaign.raised} ETH raised</span>
                <span>Goal: {campaign.goal} ETH</span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div 
                  style={{
                    height: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                    transition: 'all 0.3s',
                    width: `${Math.min(progress, 100)}%`
                  }}
                ></div>
              </div>
              <div style={{
                textAlign: 'right',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                {Math.round(progress)}% funded
              </div>
            </div>
          </div>

          <div style={{ marginLeft: '1.5rem', textAlign: 'right', minWidth: '120px' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {campaign.raised} ETH
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              of {campaign.goal} ETH
            </div>
            <Link
              to={`/campaign/${campaign.address}`}
              style={{
                display: 'inline-block',
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
            >
              View Campaign
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      e.target.style.transform = 'translateY(0)';
    }}
    >
      {/* Campaign Image */}
      <div style={{
        height: '12rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {campaign.imageUrl ? (
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <Target style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem auto' }} />
            <span style={{ fontWeight: '600' }}>{campaign.category}</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '0.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {campaign.title}
        </h3>
        
        <p style={{
          color: '#6b7280',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {campaign.description}
        </p>

        {/* Creator Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          <span style={{ marginRight: '0.25rem' }}>by</span>
          <span style={{ fontWeight: '500' }}>{formatAddress(campaign.creator)}</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.25rem'
          }}>
            <span style={{ fontWeight: '600' }}>{campaign.raised} ETH</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            height: '0.5rem'
          }}>
            <div 
              style={{
                height: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                transition: 'all 0.3s',
                width: `${Math.min(progress, 100)}%`
              }}
            ></div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#6b7280',
            marginTop: '0.25rem'
          }}>
            <span>Raised</span>
            <span>Goal: {campaign.goal} ETH</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users style={{ width: '1rem', height: '1rem' }} />
            <span>{campaign.backers} backers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock style={{ width: '1rem', height: '1rem' }} />
            <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/campaign/${campaign.address}`}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.625rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
            ...(campaign.isApproved && !isCompleted && !isExpired ? {
              backgroundColor: '#4f46e5',
              color: 'white'
            } : {
              backgroundColor: '#d1d5db',
              color: '#6b7280',
              cursor: 'not-allowed'
            })
          }}
          onMouseOver={(e) => {
            if (campaign.isApproved && !isCompleted && !isExpired) {
              e.target.style.backgroundColor = '#4338ca';
            }
          }}
          onMouseOut={(e) => {
            if (campaign.isApproved && !isCompleted && !isExpired) {
              e.target.style.backgroundColor = '#4f46e5';
            }
          }}
        >
          {!campaign.isApproved ? 'Pending Approval' : 
           isCompleted ? 'Completed' :
           isExpired ? 'Campaign Ended' : 'View Campaign'}
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;