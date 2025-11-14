import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '#10b981' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#ef4444' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '#3b82f6' }
  };

  const color = colors[type];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ color: color.icon, flexShrink: 0 }}>
        {icons[type]}
      </div>
      
      <div style={{ flex: 1, color: color.text, fontSize: '14px', fontWeight: '500' }}>
        {message}
      </div>
      
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: color.text,
          opacity: 0.7
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;