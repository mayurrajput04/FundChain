import WalletConnect from './components/common/WalletConnect';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import DiscoveryPage from './components/backer/DiscoveryPage';
import CampaignDetail from './components/backer/CampaignDetail';
import CreatorDashboard from './components/creator/CreatorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import BackerDashboard from './components/backer/BackerDashboard'; // NEW IMPORT
import { useWeb3 } from './hooks/useWeb3';
import AdminLogin from './components/admin/AdminLogin';



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
          <Route path="/" element={<DiscoveryPage />} />
          <Route path="/discover" element={<DiscoveryPage />} />
          <Route path="/campaign/:address" element={<CampaignDetail />} />

          {/* Backer Dashboard - NEW ROUTE */}
          <Route 
            path="/backer" 
            element={isConnected ? <BackerDashboard /> : <Navigate to="/discover" />} 
          />
          
          {/* Creator Dashboard */}
          <Route 
            path="/creator" 
            element={isConnected ? <CreatorDashboard /> : <Navigate to="/discover" />} 
          />
          
            {/* Admin Dashboard */}
            <Route 
              path="/admin" 
              element={isConnected ? <AdminDashboard /> : <Navigate to="/discover" />} 
            />

            {/* Protected Routes */}
            <Route path="/backer" element={<BackerDashboard />} />
            <Route path="/creator" element={<CreatorDashboard />} />

            {/* Secret Admin Route - NOT IN NAV */}
            <Route path="/admin-secret-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Admin Route - NO PROTECTION HERE, AdminDashboard handles it */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/discover" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;