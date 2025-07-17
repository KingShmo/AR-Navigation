import React, { useState, useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import PulsatingArrow from './PulsatingArrow';
import type { NavigationMode } from './types';

// Simple pulsating effect component
const PulseEffect: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.1 : 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      transform: `scale(${scale})`,
      transition: 'transform 0.5s ease-in-out'
    }}>
      {children}
    </div>
  );
};

// Helper component for Google Maps style direction indicator with JPMC colors
const DirectionIndicator = ({ 
  direction = 'forward',
  distance = 50 
}: { 
  direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator'; 
  distance?: number;
}) => {
  // Get color and icon based on direction, using JPMC colors
  const getDirectionInfo = () => {
    switch (direction) {
      case 'left': return { 
        color: jpmcColors.primary, // JPMC blue
        icon: '←', 
        label: 'Turn left',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        )
      };
      case 'right': return { 
        color: jpmcColors.accentOrange, // JPMC orange
        icon: '→', 
        label: 'Turn right',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        )
      };
      case 'stairs': return { 
        color: jpmcColors.accentGreen, // JPMC green
        icon: '↑↓', 
        label: 'Take stairs',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h-2V9h2V5h2v4h2v4h-2v4z"/>
          </svg>
        )
      };
      case 'elevator': return { 
        color: jpmcColors.accentYellow, // JPMC yellow
        icon: '⬆⬇', 
        label: 'Take elevator',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M7 10l5 5 5-5z"/>
            <path d="M7 14l5-5 5 5z"/>
          </svg>
        )
      };
      default: return { 
        color: jpmcColors.secondary, // JPMC dark blue
        icon: '↑', 
        label: 'Continue straight',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/>
          </svg>
        )
      };
    }
  };
  
  const { color, label, svg } = getDirectionInfo();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Large direction indicator with pulse effect */}
      <PulseEffect>
        <div style={{
          backgroundColor: color,
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          marginBottom: '10px'
        }}>
          {svg}
        </div>
      </PulseEffect>
      
      {/* Direction text */}
      <div style={{
        color: '#212121',
        fontWeight: 'bold',
        fontSize: '16px',
        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '4px 12px',
        borderRadius: '16px'
      }}>
        {label}
      </div>
      
      {/* Distance */}
      <div style={{
        color: '#5f6368',
        fontSize: '14px',
        marginTop: '4px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '2px 8px',
        borderRadius: '12px'
      }}>
        {distance} ft ahead
      </div>
    </div>
  );
};

// The Enhanced3DPerson component is now imported from its own file

// Nothing here - removed unused component

interface GoogleStyle3DViewProps {
  destination: string;
  eta: number;
  distance: number;
  direction: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  navMode: NavigationMode;
  isDarkMode?: boolean;
  onNavigate?: (point: { x: number; y: number; z: number }) => void;
  controlsRef?: React.RefObject<any>;
  children?: React.ReactNode;
  onToggleViewMode?: () => void;
  hideCenterDiamond?: boolean;
}

const GoogleStyle3DView: React.FC<GoogleStyle3DViewProps> = ({
  destination,
  eta,
  distance,
  direction,
  navMode,
  isDarkMode = false,
  onNavigate,
  controlsRef,
  children,
  onToggleViewMode,
  hideCenterDiamond
}) => {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* 3D Canvas will be rendered by parent component */}
      {children}
        {/* Maps Style Header with JPMC colors */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.white,
        borderRadius: jpmcThemeUI.borderRadius.lg,
        padding: '12px',
        boxShadow: jpmcThemeUI.shadows.md,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 101
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: jpmcColors.primary, 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>          <div>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '16px',
              color: isDarkMode ? jpmcColors.white : jpmcColors.text 
            }}>{destination}</div>
            <div style={{ 
              color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight, 
              fontSize: '14px' 
            }}>
              {Math.floor(eta/60)} min {eta % 60} sec • {distance} ft
            </div>
          </div>
        </div>
        <button 
          style={{
            backgroundColor: jpmcColors.primary,
            color: jpmcColors.white,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.md,
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.sm
          }}
        >
          End
        </button>
      </div>
        {/* Direction Arrow Panel with JPMC styling */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
      }}>
        <div style={{
          backgroundColor: isDarkMode 
            ? `rgba(${parseInt(jpmcColors.dark.slice(1, 3), 16)}, ${parseInt(jpmcColors.dark.slice(3, 5), 16)}, ${parseInt(jpmcColors.dark.slice(5, 7), 16)}, 0.9)`
            : 'rgba(255,255,255,0.9)',
          borderRadius: jpmcThemeUI.borderRadius.xl,
          width: '100%',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: jpmcThemeUI.shadows.md,
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: isDarkMode ? jpmcColors.white : jpmcColors.text
          }}>
            {direction === 'left' ? 'Turn Left' : 
             direction === 'right' ? 'Turn Right' : 
             direction === 'stairs' ? 'Take Stairs' :
             direction === 'elevator' ? 'Take Elevator' : 
             'Continue Straight'}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{
              backgroundColor: (() => {
                switch(direction) {
                  case 'left': return jpmcColors.primary;
                  case 'right': return jpmcColors.accentOrange;
                  case 'stairs': return jpmcColors.accentGreen;
                  case 'elevator': return jpmcColors.accentYellow;
                  default: return jpmcColors.secondary;
                }
              })(),
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              boxShadow: jpmcThemeUI.shadows.sm,
              marginRight: '10px'
            }}>
              {(() => {
                switch (direction) {
                  case 'left': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                  );
                  case 'right': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  );
                  case 'stairs': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h-2V9h2V5h2v4h2v4h-2v4z"/>
                    </svg>
                  );
                  case 'elevator': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M7 10l5 5 5-5z"/>
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  );
                  default: return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/>
                    </svg>
                  );
                }
              })()}
            </div>
            
            <div style={{ 
              color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight, 
              fontSize: '14px' 
            }}>
              In {distance} feet
            </div>
          </div>
        </div>
      </div>
        {/* JPMC Style Bottom Navigation Circle */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        height: '180px',
        backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.white,
        borderRadius: '50%',
        boxShadow: isDarkMode 
          ? `0 4px 16px ${jpmcColors.overlay}`
          : jpmcThemeUI.shadows.lg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
      }}>
        <DirectionIndicator 
          direction={direction} 
          distance={distance} 
        />
      </div>
        {/* JPMC-styled recenter button */}
      <div style={{
        position: 'absolute',
        bottom: '220px',
        left: '20px',
        zIndex: 102
      }}>
        <button 
          style={{
            backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.white,
            color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.round,
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.md,
            transition: jpmcThemeUI.transitions.medium
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.primary}>
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>
      </div>
        {/* JPMC-styled layers button */}
      <div style={{
        position: 'absolute',
        bottom: '220px',
        right: '20px',
        zIndex: 102
      }}>
        <button 
          style={{
            backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.white,
            color: isDarkMode ? jpmcColors.white : jpmcColors.secondary,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.round,
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.md,
            transition: jpmcThemeUI.transitions.medium
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.secondary}>
            <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
          </svg>
        </button>
      </div>
      
      {/* Add AR mode switch button */}
      {onToggleViewMode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 102
        }}>
          <button 
            onClick={onToggleViewMode}
            style={{
              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
              border: 'none',
              borderRadius: jpmcThemeUI.borderRadius.md,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: jpmcThemeUI.shadows.md,
              transition: jpmcThemeUI.transitions.medium,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.primary}>
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zm-15 0v-2h-3v-3H2v5h5zm0-15H4V4H2v5h5V7z" />
            </svg>
            Switch to AR View
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced version that integrates PulsatingArrow for more dynamic 3D indicators
const EnhancedGoogleStyle3DView: React.FC<GoogleStyle3DViewProps> = (props) => {
  const { direction, isDarkMode, onNavigate, hideCenterDiamond } = props;
  
  return (
    <GoogleStyle3DView {...props}>
      {props.children}
      
      {/* Add a pulsating arrow for better visibility in 3D */}
      {!hideCenterDiamond && (
        <div style={{
          position: 'absolute',
          bottom: '45%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99,
          pointerEvents: 'none'
        }}>
          <PulsatingArrow 
            direction={direction}
            size={5}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </GoogleStyle3DView>
  );
};

export { GoogleStyle3DView, EnhancedGoogleStyle3DView };
