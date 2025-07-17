import React, { useState } from 'react';
import GoogleStyleARView from './GoogleStyleARView';
import type { NavigationMode } from './types';

interface TestARViewProps {
  destination?: string;
  eta?: number;
  distance?: number;
  direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  navMode?: NavigationMode;
  isDarkMode?: boolean;
  onToggleViewMode?: () => void;
}

const TestARView: React.FC<TestARViewProps> = ({ 
  destination = "Meeting Room",
  eta = 180,
  distance = 60,
  direction = "forward",
  isDarkMode = false,
  onToggleViewMode
}) => {
  const [isActive, setIsActive] = useState(true); // Start with camera active in AR mode
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      {/* Full screen AR view with minimal UI */}
      <div style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}>        <GoogleStyleARView
          active={isActive}
          direction={direction}
          destination={destination}
          eta={eta}
          distance={distance}
          isDarkMode={isDarkMode}
          onToggleViewMode={onToggleViewMode}
          onCameraReady={() => console.log('AR Camera ready')}
          onCameraError={(error) => console.error('AR Camera error:', error)}
        />
          {/* Exit AR mode buttons */}
        {onToggleViewMode && (
          <>
            {/* Bottom right corner button (original) */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 1000
            }}>
              <button
                onClick={onToggleViewMode}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  color: '#1A73E8',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '20px' }}>🌍</span>
              </button>
            </div>
            
            {/* Top right corner button (new) */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1000
            }}>
              <button
                onClick={onToggleViewMode}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#1A73E8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Return to 3D View
              </button>
            </div>
          </>
        )}
        
        {!isActive && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#202124' : '#f0f0f0',
            color: '#1A73E8',
            padding: '20px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              Camera Access Required
            </div>
            <div style={{ textAlign: 'center', maxWidth: '80%', marginBottom: '20px' }}>
              This app needs camera access for the AR navigation experience. Please allow camera access in your browser settings.
            </div>
            <button
              onClick={() => setIsActive(true)}
              style={{
                backgroundColor: '#1A73E8',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestARView;
