import React, { useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';

interface ViewModeToggleProps {
  isARMode: boolean;
  toggleViewMode: () => void;
  isDarkMode?: boolean;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  isARMode, 
  toggleViewMode,
  isDarkMode = false
}) => {
  // Add animation styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <button
        onClick={toggleViewMode}        style={{
          backgroundColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.7)' 
            : isARMode 
              ? 'rgba(255, 255, 255, 0.9)'
              : jpmcColors.primary,
          color: isDarkMode 
            ? jpmcColors.white 
            : isARMode 
              ? jpmcColors.primary
              : jpmcColors.white,
          border: `2px solid ${isARMode ? jpmcColors.primary : 'transparent'}`,
          borderRadius: jpmcThemeUI.borderRadius.md,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: jpmcThemeUI.shadows.lg,
          transition: jpmcThemeUI.transitions.medium,
          fontWeight: 600,
          fontSize: '15px',
          backdropFilter: 'blur(8px)',
          animation: 'pulse 2s infinite'
        }}
      >
        {isARMode ? (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.primary}>
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
            Switch to 3D View
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.primary}>
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zm-15 0v-2h-3v-3H2v5h5zm0-15H4V4H2v5h5V7z" />
            </svg>
            Switch to AR View
          </>
        )}
      </button>      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px',
        color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
        textAlign: 'center',
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
        padding: '4px 10px',
        borderRadius: '12px',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {isARMode ? 'Currently in AR Mode' : 'Currently in 3D View'}
      </div>
    </div>
  );
};

export default ViewModeToggle;
