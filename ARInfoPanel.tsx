import React, { useState } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';

interface ARInfoPanelProps {
  onClose?: () => void;
  isDarkMode?: boolean;
}

const ARInfoPanel: React.FC<ARInfoPanelProps> = ({ onClose, isDarkMode = true }) => {
  const [currentTab, setCurrentTab] = useState<'info'|'help'|'about'>('info');
  
  const renderTabContent = () => {
    switch (currentTab) {
      case 'info':
        return (          <div>
            <h3 style={{ color: isDarkMode ? jpmcColors.accent : jpmcColors.primary, marginTop: 0 }}>AR Navigation Guide</h3>
            <p>This application demonstrates advanced AR office navigation using Three.js and React.</p>
            <ul style={{ paddingLeft: '1.2rem' }}>
              <li>Click anywhere on the office floor to navigate to that location</li>
              <li>Use the controls on the bottom right to adjust your view</li>
              <li>Select a specific destination from the menu above</li>
              <li>Choose your preferred navigation mode (walking, wheelchair, etc.)</li>
            </ul>
          </div>
        );
      case 'help':
        return (          <div>
            <h3 style={{ color: isDarkMode ? jpmcColors.accent : jpmcColors.primary, marginTop: 0 }}>Control Guide</h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: isDarkMode ? jpmcColors.accentBlue : jpmcColors.secondary }}>Mouse Controls:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                <li>Left-click & drag: Rotate camera</li>
                <li>Right-click & drag: Pan camera</li>
                <li>Scroll wheel: Zoom in/out</li>
                <li>Left-click on floor: Set destination</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: isDarkMode ? jpmcColors.accentBlue : jpmcColors.secondary }}>Touch Controls:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                <li>One finger drag: Rotate camera</li>
                <li>Two finger drag: Pan camera</li>
                <li>Pinch: Zoom in/out</li>
                <li>Tap on floor: Set destination</li>
              </ul>
            </div>
          </div>
        );
      case 'about':
        return (          <div>
            <h3 style={{ color: isDarkMode ? jpmcColors.accent : jpmcColors.primary, marginTop: 0 }}>About This Demo</h3>
            <p>
              This AR navigation demo showcases the future of indoor wayfinding at JPMorgan Chase offices. 
              The application uses Three.js for 3D rendering and React for UI components.
            </p>
            <p>
              In a production environment, this would connect to:
            </p>
            <ul style={{ paddingLeft: '1.2rem' }}>
              <li>Indoor positioning systems for real-time location tracking</li>
              <li>Building management systems for occupancy data</li>
              <li>Meeting room booking systems for availability</li>
              <li>Real cameras for true AR experience through your device</li>
            </ul>
            <p style={{ fontSize: '0.9rem', color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight, marginTop: '1rem' }}>
              Version 1.0.0 • Built with ❤️ using React & Three.js
            </p>
          </div>
        );
    }
  };
    return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '20px',
      width: '320px',
      backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.white,
      color: isDarkMode ? jpmcColors.white : jpmcColors.text,
      borderRadius: jpmcThemeUI.borderRadius.md,
      boxShadow: isDarkMode ? '0 8px 24px rgba(0, 114, 198, 0.4)' : jpmcThemeUI.shadows.lg,
      overflow: 'hidden',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
      border: isDarkMode ? `1px solid ${jpmcColors.primary}40` : 'none',
      backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
    }}>
      <div style={{
        display: 'flex',
        borderBottom: isDarkMode ? `1px solid ${jpmcColors.primary}40` : `1px solid ${jpmcColors.gray}`,
      }}>
        <button
          onClick={() => setCurrentTab('info')}
          style={{
            flex: 1,
            padding: '12px 8px',
            backgroundColor: currentTab === 'info' ? jpmcColors.primary : 'transparent',
            color: currentTab === 'info' ? jpmcColors.white : jpmcColors.text,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: jpmcThemeUI.transitions.fast,
          }}
        >
          Navigation
        </button>
        <button
          onClick={() => setCurrentTab('help')}
          style={{
            flex: 1,
            padding: '12px 8px',
            backgroundColor: currentTab === 'help' ? jpmcColors.primary : 'transparent',
            color: currentTab === 'help' ? jpmcColors.white : jpmcColors.text,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: jpmcThemeUI.transitions.fast,
          }}
        >
          Controls
        </button>
        <button
          onClick={() => setCurrentTab('about')}
          style={{
            flex: 1,
            padding: '12px 8px',
            backgroundColor: currentTab === 'about' ? jpmcColors.primary : 'transparent',
            color: currentTab === 'about' ? jpmcColors.white : jpmcColors.text,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: jpmcThemeUI.transitions.fast,
          }}
        >
          About
        </button>
      </div>
        <div style={{ padding: '16px' }}>
        {renderTabContent()}
      </div>
      
      <div style={{
        padding: '12px',
        borderTop: isDarkMode ? `1px solid ${jpmcColors.primary}40` : `1px solid ${jpmcColors.gray}`,
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={onClose}
          style={{
            backgroundColor: jpmcColors.secondary,
            color: jpmcColors.white,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.sm,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: jpmcThemeUI.transitions.fast,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ARInfoPanel;
