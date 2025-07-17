import React, { useState, useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import AIRecommendations from './AIRecommendations';
import type { NavigationMode } from './types';

interface AIAssistantProps {
  destination?: string;
  navMode: NavigationMode;
  etaSeconds: number;
  isDarkMode: boolean;
  isARMode: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  destination,
  navMode,
  etaSeconds,
  isDarkMode,
  isARMode
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  
  // In AR mode, default to minimized state
  useEffect(() => {
    setIsMinimized(isARMode);
  }, [isARMode]);

  // Handle minimize/maximize toggle
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle completely hiding the panel
  const hidePanel = () => {
    setShowPanel(false);
  };

  // Handle showing the panel again
  const showPanelAgain = () => {
    setShowPanel(true);
    setIsMinimized(false);
  };

  if (!showPanel) {
    return (
      <div 
        onClick={showPanelAgain}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: jpmcColors.accentBlue,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: jpmcColors.white,
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: jpmcThemeUI.shadows.md,
          cursor: 'pointer',
          transition: jpmcThemeUI.transitions.medium
        }}
      >
        AI
      </div>
    );
  }

  return (
    <div style={{
      position: isARMode ? 'fixed' : 'relative',
      bottom: isARMode ? '20px' : 'auto',
      right: isARMode ? '20px' : 'auto',
      width: isARMode ? 'calc(100% - 40px)' : '100%',
      maxWidth: isARMode ? '350px' : '100%',
      zIndex: 1000,
      transition: jpmcThemeUI.transitions.medium
    }}>
      {isMinimized ? (
        <div style={{
          backgroundColor: isDarkMode ? jpmcColors.secondary : jpmcColors.white,
          borderRadius: jpmcThemeUI.borderRadius.lg,
          boxShadow: jpmcThemeUI.shadows.lg,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          border: `1px solid ${isDarkMode ? jpmcColors.accentBlue : jpmcColors.gray}`
        }}
          onClick={toggleMinimized}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: jpmcColors.accentBlue,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: jpmcColors.white,
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              AI
            </div>
            <div>
              <p style={{
                margin: 0,
                color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
                fontSize: '15px',
                fontWeight: 600
              }}>
                AI Assistant Available
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                hidePanel();
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDarkMode ? jpmcColors.white : jpmcColors.textLight,
                cursor: 'pointer',
                fontSize: '20px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              ×
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimized();
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDarkMode ? jpmcColors.white : jpmcColors.textLight,
                cursor: 'pointer',
                fontSize: '20px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              ▲
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={hidePanel}
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? jpmcColors.white : jpmcColors.text,
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0
              }}
            >
              ×
            </button>
            <button
              onClick={toggleMinimized}
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? jpmcColors.white : jpmcColors.text,
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0
              }}
            >
              ▼
            </button>
          </div>
          <AIRecommendations
            destination={destination}
            navMode={navMode}
            etaSeconds={etaSeconds}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
