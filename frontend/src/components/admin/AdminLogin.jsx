import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import contractConfig from '../../config/contracts';

const AdminLogin = () => {
  const { account, isConnected } = useWeb3();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check wallet
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    // Check if connected wallet is admin
    const isAdmin = account?.toLowerCase() === contractConfig.admin.toLowerCase();
    if (!isAdmin) {
      setError('This wallet is not authorized as admin');
      return;
    }

    // Success - store admin session
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_timestamp', Date.now().toString());
    
    navigate('/admin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Shield size={64} color="#4f46e5" style={{ marginBottom: '15px' }} />
          <h2 style={{ margin: '0 0 10px 0' }}>Admin Access</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Authorized personnel only
          </p>
        </div>

        {!isConnected ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              Please connect your admin wallet first
            </p>
          </div>
        ) : account?.toLowerCase() !== contractConfig.admin.toLowerCase() ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#991b1b', margin: 0 }}>
              ❌ This wallet is not authorized
            </p>
            <p style={{ 
              color: '#991b1b', 
              fontSize: '12px', 
              fontFamily: 'monospace',
              marginTop: '10px'
            }}>
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: '#374151',
              textAlign: 'center'
            }}>
              Your connected wallet is the administrator wallet. Admin actions are
              checked again on-chain, so this screen only opens the panel.
            </p>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#4f46e5',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Access Admin Panel
            </button>
          </form>
        )}

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <Lock size={14} style={{ marginBottom: '5px' }} />
          <div>This area is restricted to authorized administrators only</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;