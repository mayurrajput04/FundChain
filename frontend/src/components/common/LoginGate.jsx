import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../hooks/useWeb3';
import { useUserRegistry } from '../../hooks/useUserRegistry';
import RegistrationModal from './RegistrationModal';

const LoginGate = ({ children, requireRegistration = true }) => {
  const { isConnected } = useWeb3();
  const { isRegistered } = useUserRegistry();
  const { isAuthenticated, authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = React.useState(false);

  // Auto-login if registered but not authenticated
  useEffect(() => {
    if (isConnected && isRegistered && !isAuthenticated && !authLoading) {
      login();
    }
  }, [isConnected, isRegistered, isAuthenticated, authLoading, login]);

  if (authLoading) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{
        padding: '60px 40px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2>Wallet Connection Required</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          Please connect your wallet to access this page.
        </p>
      </div>
    );
  }

  if (requireRegistration && !isRegistered) {
    return (
      <>
        <div style={{
          padding: '60px 40px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <LogIn size={64} color="#f59e0b" style={{ marginBottom: '20px' }} />
          <h2>Registration Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            You need to register before accessing this feature.
          </p>
          <button
            onClick={() => setShowRegistration(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#4f46e5',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Register Now
          </button>
        </div>

        {showRegistration && (
          <RegistrationModal
            onClose={() => setShowRegistration(false)}
            onSuccess={() => {
              setShowRegistration(false);
              login();
            }}
          />
        )}
      </>
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
};

export default LoginGate;