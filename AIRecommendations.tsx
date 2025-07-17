import React, { useState } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';

interface AIRecommendationsProps {
  destination?: string;
  navMode: NavigationMode;
  etaSeconds: number;
  isDarkMode: boolean;
}

// Helper function to get time in a readable format
const getFormattedTime = (etaSeconds: number): string => {
  const minutes = Math.floor(etaSeconds / 60);
  const seconds = etaSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  destination,
  navMode,
  etaSeconds,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Static recommendations for demo
  const recommendations = [
    { 
      type: 'general',
      text: 'Based on office occupancy, now is a great time to visit the Innovation Lab',
      icon: '🔍'
    },
    {
      type: 'route',
      text: 'There\'s construction on the main hallway. Consider taking the south corridor.',
      icon: '🚧'
    },
    {
      type: 'accessibility',
      text: destination === 'Executive Office' 
        ? 'For wheelchair access to the Executive Office, use the dedicated ramp at the east entrance.'
        : 'The Innovation Lab has automated doors for easy wheelchair access.',
      icon: '♿'
    }
  ];
  
  return (
    <div style={{
      backgroundColor: isDarkMode ? jpmcColors.secondary : jpmcColors.white,
      borderRadius: jpmcThemeUI.borderRadius.lg,
      boxShadow: jpmcThemeUI.shadows.lg,
      overflow: 'hidden',
      margin: '0 0 24px 0',
      border: `1px solid ${isDarkMode ? jpmcColors.accentBlue : jpmcColors.gray}`,
      transition: jpmcThemeUI.transitions.medium
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          backgroundColor: isDarkMode ? 'rgba(0, 45, 114, 0.85)' : jpmcColors.background,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? `1px solid ${isDarkMode ? jpmcColors.accentBlue : jpmcColors.gray}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: jpmcColors.accentBlue,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: jpmcColors.white,
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            LLM
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
              fontSize: '16px',
              fontWeight: 600
            }}>
              NavigAItAR
            </h3>
            <p style={{
              margin: '4px 0 0',
              fontSize: '14px',
              color: isDarkMode ? jpmcColors.white : jpmcColors.textLight,
              opacity: 0.8
            }}>
              Smart recommendations for your journey
            </p>
          </div>
        </div>
        
        <div>
          <span style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: jpmcThemeUI.transitions.medium,
            fontSize: '24px',
            color: isDarkMode ? jpmcColors.white : jpmcColors.primary
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{
          padding: '16px 20px',
          color: isDarkMode ? jpmcColors.white : jpmcColors.text
        }}>
          {recommendations.length > 0 ? (
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {recommendations.map((rec, index) => (
                <li 
                  key={index}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : jpmcColors.backgroundDark,
                    padding: '12px 16px',
                    borderRadius: jpmcThemeUI.borderRadius.md,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: jpmcThemeUI.transitions.fast
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    lineHeight: '24px',
                    color: getRecommendationColor(rec.type, isDarkMode)
                  }}>
                    {rec.icon}
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: 500
                    }}>
                      {rec.text}
                    </p>
                    {rec.type === 'time' && (
                      <p style={{ 
                        margin: '4px 0 0', 
                        fontSize: '12px',
                        color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight,
                        fontStyle: 'italic'
                      }}>
                        Your ETA: {getFormattedTime(etaSeconds)} min
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ 
              textAlign: 'center',
              margin: '20px 0',
              color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight,
              fontSize: '14px'
            }}>
              No recommendations available for your current journey.
            </p>
          )}
          
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            padding: '10px 0 0',
            borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : jpmcColors.gray}`,
            fontSize: '13px',
            color: isDarkMode ? jpmcColors.gray : jpmcColors.textLight
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              color: jpmcColors.accentBlue,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px'
            }}>
              Customize AI recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on recommendation type
function getRecommendationColor(type: string, isDarkMode: boolean): string {
  switch (type) {
    case 'general':
      return jpmcColors.accentBlue;
    case 'route':
      return jpmcColors.accentOrange;
    case 'accessibility':
      return jpmcColors.accentGreen;
    case 'time':
      return jpmcColors.accentYellow;
    default:
      return isDarkMode ? jpmcColors.white : jpmcColors.primary;
  }
}

export default AIRecommendations;
