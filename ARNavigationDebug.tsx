import React from 'react';
import { jpmcColors } from './jpmcTheme';

/**
 * This is a simple debugging component to test if ARNavigation2 is causing the blank screen.
 * It renders a basic placeholder with navigation controls for testing.
 */
const ARNavigationDebug: React.FC = () => {
  return (
    <div style={{ 
      position: 'relative',
      height: '600px', 
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: `linear-gradient(to right, ${jpmcColors.primary}, ${jpmcColors.secondary})`,
        color: '#ffffff',
        padding: '15px 20px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 45, 114, 0.5)',
      }}>
        <div>
          <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: 900 }}>
            JPMC AR Navigation (Debug Mode)
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
            This is a test component to diagnose rendering issues
          </p>
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        textAlign: 'center'
      }}>
        <h3>Debug Navigation View</h3>
        <p>If you can see this, the basic React rendering is working correctly.</p>
        <p>The issue may be with Three.js or related libraries.</p>
        <button style={{
          backgroundColor: jpmcColors.primary,
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default ARNavigationDebug;
