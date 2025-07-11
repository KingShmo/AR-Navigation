import { jpmcColors } from './jpmcTheme';
import type { NavigationMode } from './types';

interface NavigationSettingsProps {
  onModeChange: (mode: NavigationMode) => void;
  currentMode: NavigationMode;
}

const NavigationSettings: React.FC<NavigationSettingsProps> = ({
  onModeChange,
  currentMode = 'walking'
}) => {
  const modes: NavigationMode[] = ['walking', 'wheelchair', 'stairs', 'elevator'];
  
  const getModeIcon = (mode: NavigationMode): string => {
    switch (mode) {
      case 'walking': return '🚶';
      case 'wheelchair': return '♿';
      case 'stairs': return '🪜';
      case 'elevator': return '🔼';
      default: return '🚶';
    }
  };
  
  return (
    <div style={{
      padding: '12px',
      backgroundColor: jpmcColors.background,
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0',
        color: jpmcColors.secondary,
        fontSize: '1rem'
      }}>
        Navigation Preferences
      </h3>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {modes.map(mode => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: currentMode === mode 
                ? jpmcColors.primary 
                : jpmcColors.white,
              color: currentMode === mode
                ? jpmcColors.white
                : jpmcColors.text,
              border: `1px solid ${jpmcColors.gray}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{getModeIcon(mode)}</span>
            <span style={{ textTransform: 'capitalize' }}>{mode}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationSettings;
