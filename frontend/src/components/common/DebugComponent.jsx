import React from 'react';

const DebugComponent = ({ name }) => {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#4f46e5', 
      color: 'white',
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      {name} Component Loaded Successfully! 🎉
    </div>
  );
};

export default DebugComponent;