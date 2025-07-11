import React, { useState } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';

interface ARControlsProps {
  onModeChange?: (mode: NavigationMode) => void;
  currentMode?: NavigationMode;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotateView?: () => void;
  onResetView?: () => void;
  etaSeconds?: number;
}

const ARControls: React.FC<ARControlsProps> = ({
  onModeChange,
  currentMode = 'walking',
  onZoomIn,
  onZoomOut,
  onRotateView,
  onResetView,
  etaSeconds
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatTime = (seconds: number = 0): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div style={{ 
      position: 'absolute', 
      right: '16px',
      bottom: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px',
      zIndex: 1000
    }}>
      {/* ETA Display */}
      {etaSeconds !== undefined && (
        <div style={{
          background: jpmcColors.overlay,
          padding: '8px 12px',
          borderRadius: jpmcThemeUI.borderRadius.md,
          color: jpmcColors.white,
          fontSize: '1.1rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: jpmcThemeUI.shadows.md
        }}>
          <span style={{ opacity: 0.85, fontSize: '0.9rem' }}>ETA:</span>
          {formatTime(etaSeconds)}
        </div>
      )}
      
      {/* Navigation Mode */}
      <div style={{
        background: jpmcColors.overlay,
        padding: '8px 12px',
        borderRadius: jpmcThemeUI.borderRadius.md,
        color: jpmcColors.white,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: jpmcThemeUI.shadows.md
      }}>
        <span style={{ opacity: 0.85, fontSize: '0.9rem' }}>Mode:</span>
        <select 
          value={currentMode}
          onChange={(e) => onModeChange?.(e.target.value as NavigationMode)}
          style={{
            background: 'transparent',
            color: jpmcColors.white,
            border: `1px solid ${jpmcColors.white}`,
            borderRadius: jpmcThemeUI.borderRadius.sm,
            padding: '4px 8px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <option value="walking">Walking</option>
          <option value="wheelchair">Wheelchair</option>
          <option value="stairs">Stairs</option>
          <option value="elevator">Elevator</option>
        </select>
      </div>
      
      {/* Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            backgroundColor: jpmcColors.primary,
            color: jpmcColors.white,
            width: '44px',
            height: '44px',
            borderRadius: jpmcThemeUI.borderRadius.round,
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.md,
            alignSelf: 'flex-end'
          }}
        >
          {expanded ? '✕' : '⚙️'}
        </button>
        
        {expanded && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            <button
              onClick={onZoomIn}
              style={{
                backgroundColor: jpmcColors.accentBlue,
                color: jpmcColors.white,
                width: '40px',
                height: '40px',
                borderRadius: jpmcThemeUI.borderRadius.round,
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: jpmcThemeUI.shadows.sm
              }}
            >
              +
            </button>
            <button
              onClick={onZoomOut}
              style={{
                backgroundColor: jpmcColors.accentBlue,
                color: jpmcColors.white,
                width: '40px',
                height: '40px',
                borderRadius: jpmcThemeUI.borderRadius.round,
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: jpmcThemeUI.shadows.sm
              }}
            >
              −
            </button>
            <button
              onClick={onRotateView}
              style={{
                backgroundColor: jpmcColors.accentBlue,
                color: jpmcColors.white,
                width: '40px',
                height: '40px',
                borderRadius: jpmcThemeUI.borderRadius.round,
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: jpmcThemeUI.shadows.sm
              }}
            >
              🔄
            </button>
            <button
              onClick={onResetView}
              style={{
                backgroundColor: jpmcColors.accentBlue,
                color: jpmcColors.white,
                width: '40px',
                height: '40px',
                borderRadius: jpmcThemeUI.borderRadius.round,
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: jpmcThemeUI.shadows.sm
              }}
            >
              ↺
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARControls;
