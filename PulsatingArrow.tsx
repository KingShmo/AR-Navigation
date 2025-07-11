import React, { useEffect, useState } from 'react';
import { jpmcColors } from './jpmcTheme';

interface PulsatingArrowProps {
  direction: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  size?: number;
  isDarkMode?: boolean;
}

const PulsatingArrow: React.FC<PulsatingArrowProps> = ({ direction, size = 4, isDarkMode = true }) => {
  const [scale, setScale] = useState(1);
  
  // Direction-specific colors from JPMC color palette
  const getDirectionColor = () => {
    switch (direction) {
      case 'forward':
        return jpmcColors.primary; // Blue for forward
      case 'left':
        return jpmcColors.accentBlue; // Light blue for left
      case 'right':
        return jpmcColors.accentOrange; // Orange for right
      case 'stairs':
        return jpmcColors.accentGreen; // Green for stairs
      case 'elevator':
        return jpmcColors.accentYellow; // Yellow for elevator
      default:
        return jpmcColors.primary;
    }
  };

  // Pulsating animation effect
  useEffect(() => {
    const pulsate = () => {
      setScale((prevScale) => {
        // Oscillate between 0.9 and 1.1
        if (prevScale >= 1.1) return 0.9;
        return prevScale + 0.005;
      });
    };

    const interval = setInterval(pulsate, 20);
    return () => clearInterval(interval);
  }, []);

  // SVG arrow paths based on direction
  const getArrowPath = () => {
    const baseSize = size * 16; // Base size for the SVG
    const center = baseSize / 2;
    
    switch (direction) {
      case 'forward':
        return `M${center} ${center / 2} L${center + baseSize / 4} ${center} L${center} ${center * 1.5} L${center - baseSize / 4} ${center} Z`;
      case 'left':
        return `M${center / 2} ${center} L${center} ${center - baseSize / 4} L${center} ${center + baseSize / 4} Z`;
      case 'right':
        return `M${center * 1.5} ${center} L${center} ${center - baseSize / 4} L${center} ${center + baseSize / 4} Z`;
      case 'stairs':
        // Zigzag pattern for stairs
        return `M${center - baseSize / 4} ${center * 1.2} 
                L${center - baseSize / 8} ${center * 1.2} 
                L${center - baseSize / 8} ${center * 0.9} 
                L${center + baseSize / 8} ${center * 0.9} 
                L${center + baseSize / 8} ${center * 0.6} 
                L${center + baseSize / 4} ${center * 0.6} 
                L${center} ${center * 0.3} 
                L${center - baseSize / 4} ${center * 0.6}`;
      case 'elevator':
        // Square with up arrow for elevator
        return `M${center - baseSize / 5} ${center - baseSize / 5} 
                L${center + baseSize / 5} ${center - baseSize / 5}
                L${center + baseSize / 5} ${center + baseSize / 5}
                L${center - baseSize / 5} ${center + baseSize / 5} Z
                M${center} ${center - baseSize / 3}
                L${center - baseSize / 6} ${center - baseSize / 6}
                L${center + baseSize / 6} ${center - baseSize / 6} Z`;
      default:
        return `M${center} ${center / 2} L${center + baseSize / 4} ${center} L${center} ${center * 1.5} L${center - baseSize / 4} ${center} Z`;
    }
  };  const svgSize = size * 16; // SVG size in pixels
  const color = getDirectionColor();
  
  return (
    <svg 
      width={svgSize} 
      height={svgSize} 
      viewBox={`0 0 ${svgSize} ${svgSize}`} 
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.05s ease',
        filter: isDarkMode ? `drop-shadow(0 0 ${size/2}px ${color})` : 'none',
      }}
    >
      {/* Glow effect */}
      <defs>
        <filter id={`glow-${direction}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={isDarkMode ? "3" : "2"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
        {/* Main arrow */}
      <path
        d={getArrowPath()}
        fill={color}
        stroke={isDarkMode ? color : jpmcColors.white}
        strokeWidth={isDarkMode ? "1.5" : "1"}
        filter={`url(#glow-${direction})`}
        opacity={isDarkMode ? "0.9" : "1"}
      />
    </svg>
  );
};

export default PulsatingArrow;
