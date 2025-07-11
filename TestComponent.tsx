import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      background: 'blue',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      margin: '20px'
    }}>
      <h1>Test Component</h1>
      <p>If you can see this, React rendering is working.</p>
    </div>
  );
};

export default TestComponent;
