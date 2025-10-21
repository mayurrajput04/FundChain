import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useUserRegistry } from '../../hooks/useUserRegistry';
import { useWeb3 } from '../../hooks/useWeb3';
import CampaignCard from '../common/CampaignCard';
import RegistrationModal from '../common/RegistrationModal';

const DiscoveryPage = () => {
  const { campaigns, loading, refreshCampaigns } = useCampaigns();
  const { isRegistered, checkRegistration } = useUserRegistry();
  const { account, isConnected } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const categories = ['All', 'Medical', 'Education', 'Community', 'Personal', 'Creative', 'Technology'];

  useEffect(() => {
    if (account) {
      checkRegistration();
    }
  }, [account, checkRegistration]);

  // Filter only approved campaigns
  const approvedCampaigns = campaigns.filter(c => c.isApproved);

  // Apply search and category filters
  const filteredCampaigns = approvedCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort campaigns (trending first - based on backers and progress)
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const scoreA = parseInt(a.backers) * 2 + (parseFloat(a.totalRaised) / parseFloat(a.goal)) * 100;
    const scoreB = parseInt(b.backers) * 2 + (parseFloat(b.totalRaised) / parseFloat(b.goal)) * 100;
    return scoreB - scoreA;
  });

  // Calculate stats
  const totalFunding = approvedCampaigns.reduce((sum, c) => sum + parseFloat(c.totalRaised), 0);
  const totalBackers = approvedCampaigns.reduce((sum, c) => sum + parseInt(c.backers), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 40px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            margin: '0 0 15px 0',
            textAlign: 'center'
          }}>
            Discover Amazing Projects
          </h1>
          <p style={{ 
            fontSize: '20px', 
            textAlign: 'center', 
            opacity: 0.9,
            margin: '0 0 40px 0'
          }}>
            Support innovative ideas and make a difference with blockchain-powered crowdfunding
          </p>

          {/* Search Bar */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative'
          }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 15px 15px 45px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Registration Banner for Connected Users */}
        {isConnected && !isRegistered && (
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
                <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Register to Start Contributing</h3>
                <p style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '14px' }}>
                  Create your on-chain profile to support campaigns and track your contributions.
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
        )}

        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Target size={20} color="#4f46e5" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Active Campaigns</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
              {approvedCampaigns.length}
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <TrendingUp size={20} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Funding</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
              {totalFunding.toFixed(2)} ETH
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <TrendingUp size={20} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Backers</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
              {totalBackers}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Filter size={20} color="#6b7280" />
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Filter by Category</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  border: selectedCategory === category ? '2px solid #4f46e5' : '1px solid #d1d5db',
                  borderRadius: '20px',
                  backgroundColor: selectedCategory === category ? '#eef2ff' : 'white',
                  color: selectedCategory === category ? '#4f46e5' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedCategory === category ? '500' : 'normal',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
              >
                {category}
                {category !== 'All' && (
                  <span style={{
                    marginLeft: '6px',
                    padding: '2px 6px',
                    backgroundColor: selectedCategory === category ? '#4f46e5' : '#f3f4f6',
                    color: selectedCategory === category ? 'white' : '#6b7280',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    {approvedCampaigns.filter(c => c.category === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>
            {searchTerm || selectedCategory !== 'All' 
              ? `Found ${filteredCampaigns.length} campaign${filteredCampaigns.length !== 1 ? 's' : ''}`
              : 'All Campaigns'
            }
          </h2>
          <button
            onClick={refreshCampaigns}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <Clock size={48} color="#9ca3af" style={{ marginBottom: '15px' }} />
            <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading campaigns...</p>
          </div>
        ) : sortedCampaigns.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <Search size={48} color="#9ca3af" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>
              {searchTerm || selectedCategory !== 'All' 
                ? 'No campaigns found'
                : 'No active campaigns yet'
              }
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your filters or search term'
                : 'Check back soon for exciting projects!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {sortedCampaigns.map(campaign => (
              <CampaignCard 
                key={campaign.address} 
                campaign={campaign}
                isRegistered={isRegistered}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {sortedCampaigns.length > 0 && sortedCampaigns.length >= 12 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Load More Campaigns
            </button>
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
  );
};

export default DiscoveryPage;