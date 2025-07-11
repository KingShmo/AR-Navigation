// JPMorgan Chase color palette
export const jpmcColors = {  primary: '#0072C6', // JPMorgan blue
  secondary: '#002D72', // Dark blue
  accent: '#6CACE4', // Light blue
  accentBlue: '#00A9E0', // Bright blue
  highlight: '#00A9E0', // Bright blue
  accentGreen: '#78BE20', // Green
  accentOrange: '#FF9E1B', // Orange
  accentYellow: '#FFD100', // Yellow
  accentRed: '#FF5252', // Red
  dark: '#101820', // Almost black
  background: '#F4F4F4',
  backgroundDark: '#EAEAEA',
  surfaceLight: '#FFFFFF',
  text: '#222222',
  textLight: '#666666',
  white: '#FFFFFF',
  gray: '#E1E5EA',
  grayDark: '#B3B3B3',
  overlay: 'rgba(0, 45, 114, 0.75)', // Secondary with opacity
};

// UI theme for consistent styling
export const jpmcThemeUI = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.14)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.16)'
  },
  transitions: {
    fast: 'all 0.15s ease',
    medium: 'all 0.25s ease',
    slow: 'all 0.35s ease'
  }
};
