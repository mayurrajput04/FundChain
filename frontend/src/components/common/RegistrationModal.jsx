import React, { useState } from 'react';
import { X, User, Mail, UserCircle } from 'lucide-react';
import { useUserRegistry, UserRole } from '../../hooks/useUserRegistry';

const RegistrationModal = ({ onClose, onSuccess }) => {
  const { registerUser, checkUsernameAvailability, loading } = useUserRegistry();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: UserRole.BOTH,
    profileImage: ''
  });
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

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
      return;
    }

    // Check availability
    const available = await checkUsernameAvailability(lowercaseValue);
    if (!available) {
      setUsernameError('Username is already taken');
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (value) => {
    setFormData({ ...formData, email: value });
    setEmailError(validateEmail(value));
  };

  const handleSubmit = async () => {
    try {
      await registerUser(
        formData.username,
        formData.email,
        formData.profileImage,
        formData.role
      );
      
      alert('✅ Registration successful! You can now create campaigns.');
      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error: ' + error.message);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.username && formData.email && !usernameError && !emailError;
    }
    return true;
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
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>
            {step === 1 ? 'Create Account' : 'Choose Your Role'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {step === 1 && (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                To create campaigns, you need to register first. This creates your on-chain profile.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${usernameError ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {usernameError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                    {usernameError}
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                  Lowercase letters, numbers, and underscores only (3-20 chars)
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${emailError ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {emailError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                    {emailError}
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', margin: '5px 0 0 0' }}>
                  Your email will be hashed for privacy
                </p>
              </div>

              <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
                <strong>Why register?</strong>
                <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                  <li>Required to create campaigns</li>
                  <li>Build your reputation</li>
                  <li>Participate in the community</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                What would you like to do on FundChain?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.BACKER ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.BACKER ? '#eef2ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === UserRole.BACKER}
                    onChange={() => setFormData({ ...formData, role: UserRole.BACKER })}
                    style={{ marginRight: '10px' }}
                  />
                  <strong>Backer</strong>
                  <p style={{ margin: '5px 0 0 28px', fontSize: '14px', color: '#6b7280' }}>
                    I want to support campaigns
                  </p>
                </label>

                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.CREATOR ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.CREATOR ? '#eef2ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === UserRole.CREATOR}
                    onChange={() => setFormData({ ...formData, role: UserRole.CREATOR })}
                    style={{ marginRight: '10px' }}
                  />
                  <strong>Creator</strong>
                  <p style={{ margin: '5px 0 0 28px', fontSize: '14px', color: '#6b7280' }}>
                    I want to create campaigns
                  </p>
                </label>

                <label 
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.role === UserRole.BOTH ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === UserRole.BOTH ? '#eef2ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === UserRole.BOTH}
                    onChange={() => setFormData({ ...formData, role: UserRole.BOTH })}
                    style={{ marginRight: '10px' }}
                  />
                  <strong>Both</strong>
                  <p style={{ margin: '5px 0 0 28px', fontSize: '14px', color: '#6b7280' }}>
                    I want to create and support campaigns
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: canProceed() ? '#4f46e5' : '#9ca3af',
                color: 'white',
                cursor: canProceed() ? 'pointer' : 'not-allowed'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;