import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';
import CampaignCard from '../common/CampaignCard';

const DiscoveryPage = () => {
  const { campaigns, loading, error, isAdmin } = useCampaigns();
  const navigate = useNavigate();
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showAll, setShowAll] = useState(false); // Toggle for showing unapproved

  const categories = ['All', 'Medical', 'Education', 'Community', 'Personal', 'Creative', 'Technology'];

  useEffect(() => {
    filterAndSortCampaigns();
  }, [campaigns, searchTerm, selectedCategory, sortBy, showAll]);

  const filterAndSortCampaigns = () => {
    console.log('🔍 Total campaigns loaded:', campaigns.length);
    
    let filtered = campaigns;

    // Filter by approval status
    if (!showAll) {
      filtered = filtered.filter(campaign => campaign.isApproved && campaign.isActive);
      console.log('✅ Approved & Active campaigns:', filtered.length);
    } else {
      console.log('👀 Showing all campaigns (including unapproved)');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    // Sort campaigns
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.deadline - a.deadline);
        break;
      case 'ending':
        filtered.sort((a, b) => a.deadline - b.deadline);
        break;
      case 'most-funded':
        filtered.sort((a, b) => parseFloat(b.totalRaised) - parseFloat(a.totalRaised));
        break;
      case 'most-backers':
        filtered.sort((a, b) => b.backers - a.backers);
        break;
      default:
        break;
    }

    console.log('📋 Filtered campaigns:', filtered.length);
    setFilteredCampaigns(filtered);
  };

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            Discover Campaigns
          </h1>
          <p style={{ color: '#6b7280' }}>
            {campaigns.length} total campaigns • {filteredCampaigns.length} shown
          </p>
        </div>
        
        {!isAdmin && (
          <button
            onClick={() => navigate('/creator')}
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
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
          <p style={{ color: '#dc2626', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
          <strong>Debug:</strong> Total campaigns loaded: {campaigns.length} | 
          Approved: {campaigns.filter(c => c.isApproved).length} | 
          Unapproved: {campaigns.filter(c => !c.isApproved).length}
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Search */}
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                color: '#9ca3af', 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Category Filter and Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="newest">Newest</option>
              <option value="ending">Ending Soon</option>
              <option value="most-funded">Most Funded</option>
              <option value="most-backers">Most Backers</option>
            </select>

            {/* Toggle for showing all campaigns */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Show unapproved campaigns</span>
            </label>

            <div style={{ 
              display: 'flex', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem',
              overflow: 'hidden',
              marginLeft: 'auto'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#e5e7eb' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Grid style={{ width: '1rem', height: '1rem', color: viewMode === 'grid' ? '#374151' : '#6b7280' }} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#e5e7eb' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <List style={{ width: '1rem', height: '1rem', color: viewMode === 'list' ? '#374151' : '#6b7280' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {loading ? (
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
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading campaigns...</p>
        </div>
      ) : (
        <div style={viewMode === 'grid' ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        } : {
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.address} campaign={campaign} view={viewMode} />
          ))}
          
          {filteredCampaigns.length === 0 && !loading && (
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
                <Filter style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  No campaigns found
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  {campaigns.length === 0 
                    ? 'Be the first to create a campaign!' 
                    : 'Try adjusting your filters or enable "Show unapproved campaigns".'}
                </p>
                {!isAdmin && (
                  <button
                    onClick={() => navigate('/creator')}
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
                )}
              </div>
            </div>
          )}
        </div>
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
  );
};

export default DiscoveryPage;