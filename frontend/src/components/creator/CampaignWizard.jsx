import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useCampaigns } from '../../hooks/useCampaigns';

const CampaignWizard = ({ onClose, onSuccess }) => {
  const { signer, chainId, isCorrectNetwork, switchToSepolia } = useWeb3();
  const { createCampaign } = useCampaigns();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Medical',
    goal: '',
    deadline: '',
    description: '',
    imageUrl: ''
  });

  const categories = ['Medical', 'Education', 'Community', 'Personal', 'Creative', 'Technology'];

  const handleNetworkSwitch = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchToSepolia();
      // After switching, the chainId will update automatically via the event listener
    } catch (error) {
      alert('Failed to switch network: ' + error.message);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleSubmit = async () => {
    // Check if we're on the correct network
    if (!isCorrectNetwork()) {
      alert('Please switch to Sepolia testnet to create campaigns');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      
      // Show detailed error message
      let errorMessage = 'Error creating campaign: ' + error.message;
      
      if (error.message.includes('Contract not initialized')) {
        errorMessage = `Contract not initialized. Please check:
1. Contract address is set in useCampaigns.js
2. You are connected to Sepolia testnet
3. Your wallet is connected properly`;
      } else if (error.message.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please get Sepolia test ETH.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Network Warning */}
        {!isCorrectNetwork() && (
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#fef3c7',
            borderBottom: '1px solid #f59e0b',
            color: '#92400e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>Wrong Network Detected</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  You are on network ID: {chainId}. Please switch to Sepolia testnet (ID: 11155111).
                </p>
              </div>
              <button
                onClick={handleNetworkSwitch}
                disabled={isSwitchingNetwork}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSwitchingNetwork ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isSwitchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {[1, 2, 3].map((s) => (
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
                  {s}
                </div>
                {s < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? '#4f46e5' : '#e5e7eb' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '20px' }}>
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h3 style={{ marginTop: 0, pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>Basic Information</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="What are you raising funds for?"
                  disabled={!isCorrectNetwork()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    opacity: isCorrectNetwork() ? 1 : 0.6
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  disabled={!isCorrectNetwork()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    opacity: isCorrectNetwork() ? 1 : 0.6
                  }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                    Goal Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    disabled={!isCorrectNetwork()}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      opacity: isCorrectNetwork() ? 1 : 0.6
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                    Deadline (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    placeholder="30"
                    min="1"
                    max="365"
                    disabled={!isCorrectNetwork()}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      opacity: isCorrectNetwork() ? 1 : 0.6
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h3 style={{ marginTop: 0, pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>Story & Details</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell your story..."
                  rows={6}
                  disabled={!isCorrectNetwork()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    opacity: isCorrectNetwork() ? 1 : 0.6
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', pointerEvents: isCorrectNetwork() ? 'auto' : 'none', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  disabled={!isCorrectNetwork()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    opacity: isCorrectNetwork() ? 1 : 0.6
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h3 style={{ marginTop: 0, opacity: isCorrectNetwork() ? 1 : 0.6 }}>Review & Submit</h3>
              
              <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
                <p><strong>Title:</strong> {formData.title}</p>
                <p><strong>Category:</strong> {formData.category}</p>
                <p><strong>Goal:</strong> {formData.goal} ETH</p>
                <p><strong>Deadline:</strong> {formData.deadline} days</p>
                <p><strong>Description:</strong> {formData.description}</p>
              </div>

              <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', opacity: isCorrectNetwork() ? 1 : 0.6 }}>
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
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || !isCorrectNetwork()}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: (step === 1 || !isCorrectNetwork()) ? 'not-allowed' : 'pointer',
              opacity: (step === 1 || !isCorrectNetwork()) ? 0.5 : 1
            }}
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isCorrectNetwork()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isCorrectNetwork() ? '#4f46e5' : '#9ca3af',
                color: 'white',
                cursor: isCorrectNetwork() ? 'pointer' : 'not-allowed'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isCorrectNetwork()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: (isSubmitting || !isCorrectNetwork()) ? '#9ca3af' : '#10b981',
                color: 'white',
                cursor: (isSubmitting || !isCorrectNetwork()) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;