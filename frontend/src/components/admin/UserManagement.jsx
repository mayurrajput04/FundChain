import { useState, useEffect } from 'react';
import { Users, Shield, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserRegistry, KYCLevel } from '../../hooks/useUserRegistry';

const UserManagement = () => {
const { 
  getAllUsers, 
  setUserKYCLevel, 
  banUser, 
  unbanUser, 
  getStats,
  isOwner,
  loading,
  userRegistryContract // ✅ FIXED: Add this
} = useUserRegistry();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, bannedUsers: 0, activeUsers: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [processingUser, setProcessingUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, banned, active

// ✅ FIXED: Real-time stats with event listeners
useEffect(() => {
  loadUsers();
  loadStats();

  // ✅ FIXED: Set up event listeners for real-time updates
  if (!userRegistryContract) return;

  const handleUserRegistered = () => {
    console.log('📢 New user registered event detected');
    loadUsers();
    loadStats();
  };

  const handleUserBanned = () => {
    console.log('📢 User banned event detected');
    loadUsers();
    loadStats();
  };

  const handleUserUnbanned = () => {
    console.log('📢 User unbanned event detected');
    loadUsers();
    loadStats();
  };

  const handleKYCUpdated = () => {
    console.log('📢 KYC level updated event detected');
    loadUsers();
  };

  userRegistryContract.on('UserRegistered', handleUserRegistered);
  userRegistryContract.on('UserBanned', handleUserBanned);
  userRegistryContract.on('UserUnbanned', handleUserUnbanned);
  userRegistryContract.on('KYCLevelUpdated', handleKYCUpdated);

  // ✅ FIXED: Cleanup listeners on unmount
  return () => {
    userRegistryContract.off('UserRegistered', handleUserRegistered);
    userRegistryContract.off('UserBanned', handleUserBanned);
    userRegistryContract.off('UserUnbanned', handleUserUnbanned);
    userRegistryContract.off('KYCLevelUpdated', handleKYCUpdated);
  };
}, [userRegistryContract]); // ✅ FIXED: Depend on userRegistryContract

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await getAllUsers(0, 100);
      setUsers(usersData);
      console.log('📋 Loaded users:', usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Failed to load users: ' + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleKYCUpgrade = async (userAddress, currentLevel) => {
    const newLevel = Math.min(currentLevel + 1, KYCLevel.ADVANCED);
    
    if (currentLevel === KYCLevel.ADVANCED) {
      alert('User already has maximum KYC level (ADVANCED)');
      return;
    }

    const levelNames = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
    const confirmed = window.confirm(
      `Upgrade KYC level?\n\nUser: ${userAddress}\nFrom: ${levelNames[currentLevel]}\nTo: ${levelNames[newLevel]}`
    );

    if (!confirmed) return;

    setProcessingUser(userAddress);
    try {
      await setUserKYCLevel(userAddress, newLevel);
      alert('✅ KYC level upgraded successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Error upgrading KYC:', err);
      alert('Failed to upgrade KYC: ' + err.message);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleKYCDowngrade = async (userAddress, currentLevel) => {
    const newLevel = Math.max(currentLevel - 1, KYCLevel.NONE);
    
    if (currentLevel === KYCLevel.NONE) {
      alert('User already has minimum KYC level (NONE)');
      return;
    }

    const levelNames = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
    const confirmed = window.confirm(
      `Downgrade KYC level?\n\nUser: ${userAddress}\nFrom: ${levelNames[currentLevel]}\nTo: ${levelNames[newLevel]}`
    );

    if (!confirmed) return;

    setProcessingUser(userAddress);
    try {
      await setUserKYCLevel(userAddress, newLevel);
      alert('✅ KYC level downgraded');
      await loadUsers();
    } catch (err) {
      console.error('Error downgrading KYC:', err);
      alert('Failed to downgrade KYC: ' + err.message);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleBan = async (userAddress) => {
    const reason = window.prompt('Enter reason for ban:');
    if (!reason) return;

    setProcessingUser(userAddress);
    try {
      await banUser(userAddress, reason);
      alert('✅ User banned successfully!');
      await loadUsers();
      await loadStats();
    } catch (err) {
      console.error('Error banning user:', err);
      alert('Failed to ban user: ' + err.message);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleUnban = async (userAddress) => {
    const confirmed = window.confirm(`Unban user ${userAddress}?`);
    if (!confirmed) return;

    setProcessingUser(userAddress);
    try {
      await unbanUser(userAddress);
      alert('✅ User unbanned successfully!');
      await loadUsers();
      await loadStats();
    } catch (err) {
      console.error('Error unbanning user:', err);
      alert('Failed to unban user: ' + err.message);
    } finally {
      setProcessingUser(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'banned') return user.isBanned;
    if (filter === 'active') return !user.isBanned;
    return true;
  });

  const getKYCLevelColor = (level) => {
    switch (level) {
      case KYCLevel.NONE: return '#9ca3af';
      case KYCLevel.BASIC: return '#3b82f6';
      case KYCLevel.INTERMEDIATE: return '#8b5cf6';
      case KYCLevel.ADVANCED: return '#10b981';
      default: return '#9ca3af';
    }
  };

  const getKYCLevelName = (level) => {
    const names = ['NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED'];
    return names[level] || 'UNKNOWN';
  };

  const getRoleName = (role) => {
    const names = ['BACKER', 'CREATOR', 'BOTH'];
    return names[role] || 'UNKNOWN';
  };

  if (!isOwner) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Only the UserRegistry contract owner can access user management.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Users size={20} color="#6b7280" />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #86efac' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <CheckCircle size={20} color="#22c55e" />
            <span style={{ fontSize: '14px', color: '#16a34a' }}>Active Users</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{stats.activeUsers}</div>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Ban size={20} color="#ef4444" />
            <span style={{ fontSize: '14px', color: '#dc2626' }}>Banned Users</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>{stats.bannedUsers}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: filter === 'all' ? '#4f46e5' : '#f3f4f6',
            color: filter === 'all' ? 'white' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: filter === 'active' ? '#10b981' : '#f3f4f6',
            color: filter === 'active' ? 'white' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Active ({users.filter(u => !u.isBanned).length})
        </button>
        <button
          onClick={() => setFilter('banned')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: filter === 'banned' ? '#ef4444' : '#f3f4f6',
            color: filter === 'banned' ? 'white' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Banned ({users.filter(u => u.isBanned).length})
        </button>
        <button
          onClick={loadUsers}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users List */}
      {loadingUsers ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No users found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredUsers.map((user) => (
            <div
              key={user.walletAddress}
              style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: user.isBanned ? '#fef2f2' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>@{user.username}</h3>
                    {user.isBanned && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        BANNED
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {user.walletAddress}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>KYC Level:</span>
                      <div style={{
                        marginTop: '5px',
                        padding: '6px 12px',
                        backgroundColor: getKYCLevelColor(user.kycLevel),
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {getKYCLevelName(user.kycLevel)}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Role:</span>
                      <div style={{ marginTop: '5px', fontSize: '14px', fontWeight: '500' }}>
                        {getRoleName(user.primaryRole)}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Reputation:</span>
                      <div style={{ marginTop: '5px', fontSize: '14px', fontWeight: '500' }}>
                        {user.reputationScore} / 1000
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Registered:</span>
                      <div style={{ marginTop: '5px', fontSize: '14px' }}>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                  {/* KYC Controls */}
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleKYCDowngrade(user.walletAddress, user.kycLevel)}
                      disabled={processingUser === user.walletAddress || user.kycLevel === KYCLevel.NONE}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: (processingUser === user.walletAddress || user.kycLevel === KYCLevel.NONE) ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: (processingUser === user.walletAddress || user.kycLevel === KYCLevel.NONE) ? 0.5 : 1
                      }}
                      title="Downgrade KYC Level"
                    >
                      ⬇️ KYC
                    </button>
                    <button
                      onClick={() => handleKYCUpgrade(user.walletAddress, user.kycLevel)}
                      disabled={processingUser === user.walletAddress || user.kycLevel === KYCLevel.ADVANCED}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: (processingUser === user.walletAddress || user.kycLevel === KYCLevel.ADVANCED) ? '#9ca3af' : '#10b981',
                        color: 'white',
                        cursor: (processingUser === user.walletAddress || user.kycLevel === KYCLevel.ADVANCED) ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                      title="Upgrade KYC Level"
                    >
                      {processingUser === user.walletAddress ? '...' : '⬆️ Upgrade KYC'}
                    </button>
                  </div>

                  {/* Ban/Unban */}
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnban(user.walletAddress)}
                      disabled={processingUser === user.walletAddress}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: processingUser === user.walletAddress ? '#9ca3af' : '#10b981',
                        color: 'white',
                        cursor: processingUser === user.walletAddress ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✅ Unban User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBan(user.walletAddress)}
                      disabled={processingUser === user.walletAddress}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: processingUser === user.walletAddress ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        cursor: processingUser === user.walletAddress ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🚫 Ban User
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;