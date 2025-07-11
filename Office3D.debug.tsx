import React, { useRef, useEffect, useState } from 'react';
import { jpmcColors } from './jpmcTheme';
import './App.css';

interface Office3DDebugProps {
  destination?: string;
  isDarkMode?: boolean;
  navMode?: string;
}

/**
 * This is a simplified debug version of Office3D component
 * It renders a basic placeholder with key functionality to test Three.js integration
 */
const Office3DDebug: React.FC<Office3DDebugProps> = ({ 
  destination = 'Innovation Lab', 
  isDarkMode = false, 
  navMode = 'walking' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulated navigation steps for UI display
  const navigationSteps = [
    { instruction: 'Continue straight for 20 ft', distance: 20 },
    { instruction: 'Turn left and proceed for 30 ft', distance: 30 },
    { instruction: 'Turn right and continue for 10 ft', distance: 10 },
    { instruction: 'Arrived at Innovation Lab', distance: 0 }
  ];
  
  useEffect(() => {
    // Show loading state briefly
    setTimeout(() => {
      setIsLoading(false);
      console.log("Debug Office3D component loaded successfully");
    }, 1000);
  }, []);
  
  return (
    <div style={{
      width: '100%',
      height: '80vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#1a2338' : '#ffffff',
      borderRadius: '12px',
      margin: '24px auto',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      {/* Navigation Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 64,
        background: `linear-gradient(90deg, ${jpmcColors.primary} 70%, ${jpmcColors.accentBlue} 100%)`,
        color: '#fff',
        fontWeight: 800,
        fontSize: '2rem',
        letterSpacing: '0.04em',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 30,
        paddingLeft: 32,
        borderBottom: `4px solid ${jpmcColors.accentGreen}`
      }}>
        JPMC AR Navigation (Debug Mode)
      </div>
      
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          Loading office environment...
        </div>
      )}
      
      {/* Debug content */}
      <div ref={mountRef} style={{ 
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '64px 0 0 0'
      }}>
        <div style={{
          backgroundColor: isDarkMode ? '#2a3142' : '#f9f9f9',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          maxWidth: '80%'
        }}>
          <h2 style={{ color: jpmcColors.primary, marginTop: 0 }}>Office3D Debug Mode</h2>
          <p>
            This is a simplified debug version without Three.js to help diagnose rendering issues.
          </p>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Destination:</strong> {destination}</p>
            <p><strong>Dark Mode:</strong> {isDarkMode ? 'On' : 'Off'}</p>
            <p><strong>Navigation Mode:</strong> {navMode}</p>
          </div>
          <button style={{
            backgroundColor: jpmcColors.primary,
            color: '#ffffff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            marginTop: '20px',
            cursor: 'pointer'
          }}>
            Try Interactive Features
          </button>
        </div>
      </div>
      
      {/* Navigation instructions overlay */}
      <div style={{
        position: 'absolute',
        top: 80,
        right: 16,
        background: 'rgba(255,255,255,0.95)',
        color: jpmcColors.primary,
        borderRadius: 8,
        padding: '14px 22px',
        fontWeight: 600,
        fontSize: '1.15rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        zIndex: 20,
        minWidth: 260
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: jpmcColors.accentBlue, marginBottom: 6 }}>
          Navigation Instructions
        </div>
        <div>WASD / Arrow keys: Move</div>
        <div>Mouse: Look / Pan / Zoom (except top bar)</div>
        <div style={{ marginTop: 8, fontWeight: 700, color: jpmcColors.accentGreen }}>
          250 ft ahead
        </div>
        <div style={{ fontWeight: 600, color: jpmcColors.accentBlue }}>
          ETA: 2:30
        </div>
        <div style={{ marginTop: 12, fontWeight: 700, color: jpmcColors.primary }}>
          Step-by-step: {navigationSteps[1].instruction}
        </div>
      </div>
    </div>
  );
};

export default Office3DDebug;
