import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useUserRegistry, KYCLevel } from '../../hooks/useUserRegistry';
import RegistrationModal from '../common/RegistrationModal';
import CampaignPreflightCheck from './CampaignPreflightCheck'; // NEW IMPORT

const CampaignWizard = ({ onClose, onSuccess }) => {
  const { signer, account, chainId, isCorrectNetwork, switchToSepolia } = useWeb3();
  const { createCampaign } = useCampaigns();
  const { isRegistered, kycLevel, loading: userLoading, checkRegistration } = useUserRegistry();
  
  const [step, setStep] = useState(0); // START AT 0 FOR PREFLIGHT CHECK
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [canProceed, setCanProceed] = useState(false); // NEW STATE
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Medical',
    goal: '',
    deadline: '',
    description: '',
    imageUrl: ''
  });

  const categories = ['Medical', 'Education', 'Community', 'Personal', 'Creative', 'Technology'];

  useEffect(() => {
    if (account && signer) {
      checkRegistration();
    }
  }, [account, signer, checkRegistration]);

  const handleNetworkSwitch = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchToSepolia();
    } catch (error) {
      alert('Failed to switch network: ' + error.message);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) {
      alert('Please pass all pre-flight checks before creating a campaign');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 Submitting campaign with data:', formData);
      await createCampaign(formData);
      onSuccess();
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      
      let errorMessage = 'Error creating campaign: ' + error.message;
      
      if (error.message.includes('You must register first')) {
        errorMessage = 'You must register before creating campaigns';
        setShowRegistrationModal(true);
        setStep(0); // Go back to preflight
      } else if (error.message.includes('Insufficient KYC level')) {
        errorMessage = 'You need KYC level BASIC or higher. Please contact admin to upgrade your KYC level.';
        setStep(0); // Go back to preflight
      } else if (error.message.includes('Your account is banned')) {
        errorMessage = 'Your account is banned. Please contact admin.';
        setStep(0); // Go back to preflight
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>Create Campaign</h2>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Progress - Now 4 steps (0-3) */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              {[0, 1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: step >= s ? '#4f46e5' : '#e5e7eb',
                    color: step >= s ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {s === 0 ? '✓' : s}
                  </div>
                  {s < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? '#4f46e5' : '#e5e7eb' }} />}
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
              {step === 0 && 'Pre-flight Check'}
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Story & Details'}
              {step === 3 && 'Review & Submit'}
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '20px' }}>
            {/* Step 0: Preflight Check */}
            {step === 0 && (
              <div>
                <CampaignPreflightCheck
                  onPassed={() => setCanProceed(true)}
                  onFailed={() => setCanProceed(false)}
                />

                {!isRegistered && (
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Register Now
                  </button>
                )}

                {isRegistered && kycLevel < KYCLevel.BASIC && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '6px',
                    border: '1px solid #f59e0b'
                  }}>
                    <strong style={{ color: '#92400e' }}>⚠️ KYC Upgrade Required</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#92400e' }}>
                      Please contact the admin to upgrade your KYC level to BASIC or higher.
                      <br />
                      <br />
                      Admin can upgrade your KYC in: Admin Dashboard → User Management
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div>
                <h3 style={{ marginTop: 0 }}>Basic Information</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="What are you raising funds for?"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                      Goal Amount (ETH) *
                    </label>
                    <input
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                      Deadline (Days) *
                    </label>
                    <input
                      type="number"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      placeholder="30"
                      min="1"
                      max="365"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Story & Details */}
            {step === 2 && (
              <div>
                <h3 style={{ marginTop: 0 }}>Story & Details</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell your story..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div>
                <h3 style={{ marginTop: 0 }}>Review & Submit</h3>
                
                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Goal:</strong> {formData.goal} ETH</p>
                  <p><strong>Deadline:</strong> {formData.deadline} days</p>
                  <p><strong>Description:</strong> {formData.description}</p>
                </div>

                <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                    <strong>Note:</strong> Your campaign will be reviewed by our admin team before going live.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                opacity: step === 0 ? 0.5 : 1
              }}
            >
              ← Back
            </button>

            {step === 0 ? (
              <button
                onClick={() => setStep(1)}
                disabled={!canProceed}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: canProceed ? '#4f46e5' : '#9ca3af',
                  color: 'white',
                  cursor: canProceed ? 'pointer' : 'not-allowed'
                }}
              >
                Start Creating →
              </button>
            ) : step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <RegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setShowRegistrationModal(false);
            checkRegistration();
          }}
        />
      )}
    </>
  );
};

export default CampaignWizard;