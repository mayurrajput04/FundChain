import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWeb3 } from './hooks/useWeb3';
import Header from './components/common/Header';
import WalletConnect from './components/common/WalletConnect';
import CreatorDashboard from './components/creator/CreatorDashboard';
import BackerDiscovery from './components/backer/DiscoveryPage';
import AdminDashboard from './components/admin/AdminDashboard';
import CampaignDetail from './components/backer/CampaignDetail';

function App() {
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  console.log('🔍 App.jsx - isConnected:', isConnected);
  console.log('🔍 App.jsx - account:', account);

  // Show wallet connect screen if not connected
  if (!isConnected) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <WalletConnect onConnect={connectWallet} />
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header 
          account={account} 
          onDisconnect={disconnectWallet}
        />
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<BackerDiscovery />} />
            <Route path="/campaign/:address" element={<CampaignDetail />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            
            {/* Admin Route - NO PROTECTION HERE, AdminDashboard handles it */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;