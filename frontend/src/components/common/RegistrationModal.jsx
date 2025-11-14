import React, { useState } from 'react';
import { X, User, Mail, UserCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useUserRegistry, UserRole } from '../../hooks/useUserRegistry';
import { useToast } from '../../contexts/ToastContext';

const RegistrationModal = ({ onClose, onSuccess }) => {
  const { registerUser, checkUsernameAvailability, loading } = useUserRegistry();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: UserRole.BOTH,
    profileImage: ''
  });
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-z0-9_]+$/.test(username)) {
      return 'Username can only contain lowercase letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleUsernameChange = async (value) => {
    const lowercaseValue = value.toLowerCase();
    setFormData({ ...formData, username: lowercaseValue });
    
    const validationError = validateUsername(lowercaseValue);
    if (validationError) {
      setUsernameError(validationError);
      setUsernameAvailable(null);
      return;
    }

    // Check availability
    setUsernameChecking(true);
    try {
      const available = await checkUsernameAvailability(lowercaseValue);
      if (!available) {
        setUsernameError('Username is already taken');
        setUsernameAvailable(false);
      } else {
        setUsernameError('');
        setUsernameAvailable(true);
      }
    } catch (error) {
      setUsernameError('Error checking username');
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleEmailChange = (value) => {
    setFormData({ ...formData, email: value });
    setEmailError(validateEmail(value));
  };

const handleSubmit = async () => {
  try {
    showToast('Creating your account...', 'info', 2000);
    
    await registerUser(
      formData.username,
      formData.email,
      formData.profileImage,
      formData.role
    );
    
    showToast('✅ Registration successful! Welcome to FundChain!', 'success');
    
    // Close modal after short delay to show success message
    setTimeout(() => {
      onSuccess();
    }, 1500);
  } catch (error) {
    console.error('Registration error:', error);
    showToast('❌ ' + error.message, 'error');
  }
};

  const canProceedStep1 = () => {
    return formData.username && 
           formData.email && 
           !usernameError && 
           !emailError && 
           usernameAvailable === true &&
           !usernameChecking;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px' }}>
                {step === 1 ? '👋 Create Your Account' : '🎯 Choose Your Role'}
              </h2>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {step === 1 ? 'Join the FundChain community' : 'What would you like to do?'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              style={{ 
                border: 'none', 
                background: 'rgba(255,255,255,0.2)', 
                cursor: 'pointer', 
                padding: '8px',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Indicator */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1,
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '2px'
            }} />
            <div style={{
              flex: 1,
              height: '4px',
              backgroundColor: step === 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step === 1 && (
            <div>
              {/* Username Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Username *
                </label>
                <div style={{ position: 'relative' }}>
                  <User 
                    size={18} 
                    color="#9ca3af"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="your_username"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: `2px solid ${
                        usernameError ? '#ef4444' : 
                        usernameAvailable ? '#10b981' : 
                        '#e5e7eb'
                      }`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  {usernameChecking && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #e5e7eb',
                        borderTopColor: '#4f46e5',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    </div>
                  )}
                  {usernameAvailable === true && !usernameChecking && (
                    <CheckCircle 
                      size={18} 
                      color="#10b981"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  )}
                </div>
                {usernameError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                    {usernameError}
                  </p>
                )}
                {usernameAvailable && !usernameError && (
                  <p style={{ color: '#10b981', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                    ✓ Username is available!
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                  Lowercase letters, numbers, and underscores only (3-20 chars)
                </p>
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail 
                    size={18} 
                    color="#9ca3af"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: `2px solid ${emailError ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
                {emailError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                    {emailError}
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                  Your email will be hashed for privacy
                </p>
              </div>

              {/* Benefits Box */}
              <div style={{ 
                backgroundColor: '#f0f9ff', 
                padding: '16px', 
                borderRadius: '8px', 
                fontSize: '14px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                  ✨ Why register?
                </div>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#3b82f6' }}>
                  <li>Create and manage campaigns</li>
                  <li>Build your reputation score</li>
                  <li>Access exclusive features</li>
                  <li>Join the community</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
                Select your primary role to personalize your experience
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Backer Option */}
                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.BACKER ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.BACKER ? '#eef2ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.role !== UserRole.BACKER) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.role !== UserRole.BACKER) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === UserRole.BACKER}
                      onChange={() => setFormData({ ...formData, role: UserRole.BACKER })}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        💰 Backer
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        I want to discover and support amazing campaigns
                      </p>
                    </div>
                  </div>
                </label>

                {/* Creator Option */}
                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.CREATOR ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.CREATOR ? '#eef2ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === UserRole.CREATOR}
                      onChange={() => setFormData({ ...formData, role: UserRole.CREATOR })}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        🚀 Creator
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        I want to create and manage fundraising campaigns
                      </p>
                    </div>
                  </div>
                </label>

                {/* Both Option */}
                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.BOTH ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.BOTH ? '#eef2ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === UserRole.BOTH}
                      onChange={() => setFormData({ ...formData, role: UserRole.BOTH })}
                      style={{ marginTop: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        ⭐ Both
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        I want to create campaigns AND support others
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex', 
          justifyContent: 'space-between',
          backgroundColor: '#f9fafb',
          borderRadius: '0 0 16px 16px'
        }}>
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            style={{
              padding: '10px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {step === 1 ? (
              <>Cancel</>
            ) : (
              <><ArrowLeft size={16} /> Back</>
            )}
          </button>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1()}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: canProceedStep1() 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#e5e7eb',
                color: 'white',
                cursor: canProceedStep1() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: loading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrationModal;