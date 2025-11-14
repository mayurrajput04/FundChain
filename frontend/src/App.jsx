import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import DiscoveryPage from './components/backer/DiscoveryPage';
import CampaignDetail from './components/backer/CampaignDetail';
import CreatorDashboard from './components/creator/CreatorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import BackerDashboard from './components/backer/BackerDashboard';
import AdminLogin from './components/admin/AdminLogin';
import WalletConnect from './components/common/WalletConnect';
import { useWeb3 } from './hooks/useWeb3';
import { ToastProvider } from './contexts/ToastContext';
import UserProfile from './components/common/UserProfile';


function App() {
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  console.log('🔍 App.jsx - isConnected:', isConnected);
  console.log('🔍 App.jsx - account:', account);

  // 🔒 Show Wallet Connect screen when not connected
  if (!isConnected) {
    return (
      <ToastProvider>
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <WalletConnect onConnect={connectWallet} />
        </div>
      </ToastProvider>
    );
  }

  // 🌐 App with Router + ToastProvider when connected
  return (
    <ToastProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
          <Header account={account} onDisconnect={disconnectWallet} />

          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<DiscoveryPage />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/campaign/:address" element={<CampaignDetail />} />

              {/* Protected Routes */}
              <Route
                path="/backer"
                element={
                  isConnected ? <BackerDashboard /> : <Navigate to="/discover" />
                }
              />

              <Route
                path="/creator"
                element={
                  isConnected ? <CreatorDashboard /> : <Navigate to="/discover" />
                }
              />

              {/* Admin Routes */}
              <Route path="/admin-secret-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />

              {/* User Profile */}
              <Route 
                path="/profile" 
                element={isConnected ? <UserProfile /> : <Navigate to="/discover" />} 
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
