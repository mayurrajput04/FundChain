import React from 'react';
import { Wallet, ArrowRight } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  return (
    <div style={{
      maxWidth: '28rem',
      width: '100%',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        margin: '0 auto 1.5rem auto',
        width: '4rem',
        height: '4rem',
        backgroundColor: '#eef2ff',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Wallet style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} />
      </div>
      
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '0.5rem'
      }}>
        Welcome to FundChain
      </h2>
      <p style={{
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Connect your wallet to start funding dreams or create your own campaign
      </p>
      
      <button
        onClick={onConnect}
        style={{
          width: '100%',
          backgroundColor: '#4f46e5',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          fontWeight: '600',
          fontSize: '1.125rem',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
      >
        <Wallet style={{ width: '1.5rem', height: '1.5rem' }} />
        <span>Connect MetaMask Wallet</span>
        <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
      </button>
      
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#dbeafe',
        borderRadius: '0.5rem'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          <strong>Demo Tip:</strong> Make sure you're connected to Sepolia testnet and have some test ETH!
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;