import React from 'react';

const RoleSelection = ({ onRoleSelect }) => {
  console.log('RoleSelection rendering'); // DEBUG

  const roles = [
    { id: 'backer', title: 'Backer', description: 'Discover and fund amazing projects' },
    { id: 'creator', title: 'Creator', description: 'Start your own fundraising campaign' },
    { id: 'admin', title: 'Admin', description: 'Moderate and manage the platform' }
  ];

  const handleRoleSelect = (roleId) => {
    console.log('Role selected:', roleId); // DEBUG
    onRoleSelect(roleId);
  };

  return (
    <div style={{ 
      maxWidth: '80rem', 
      margin: '0 auto', 
      padding: '3rem 1rem',
      backgroundColor: 'white',
      minHeight: '50vh',
      borderRadius: '1rem',
      marginTop: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Choose Your Role
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280'
        }}>
          How would you like to use FundChain?
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            style={{
              padding: '2rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{role.title}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>{role.description}</div>
          </button>
        ))}
      </div>

      {/* Debug info */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          If you can see this, RoleSelection is working! 🎉
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;