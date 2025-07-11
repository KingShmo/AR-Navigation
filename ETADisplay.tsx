import { useState, useEffect } from 'react';
import { jpmcColors } from './jpmcTheme';

interface ETADisplayProps {
  destinationName?: string;
  initialSeconds?: number;
}

const ETADisplay: React.FC<ETADisplayProps> = ({ 
  destinationName = "Meeting Room", 
  initialSeconds = 222 // 3 min 42 sec
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    
    if (!isPaused && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds, isPaused]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} min ${secs.toString().padStart(2, '0')} sec`;
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: jpmcColors.white,
      borderRadius: '12px',
      boxShadow: `0 2px 8px ${jpmcColors.secondary}20`,
      textAlign: 'center',
      marginTop: '24px'
    }}>
      <h2 style={{ color: jpmcColors.primary, marginTop: 0 }}>
        Estimated Time to {destinationName}
      </h2>
      
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 700, 
        color: jpmcColors.secondary,
        margin: '16px 0'
      }}>
        ETA: {formatTime(seconds)}
      </div>
      
      <p style={{ color: jpmcColors.text, marginBottom: '16px' }}>
        Your 3D avatar is walking to {destinationName.toLowerCase()}.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => setIsPaused(prev => !prev)}
          style={{ 
            backgroundColor: isPaused ? jpmcColors.accent : jpmcColors.primary,
            color: isPaused ? jpmcColors.text : jpmcColors.white,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => setSeconds(initialSeconds)}
          style={{ 
            backgroundColor: jpmcColors.gray,
            color: jpmcColors.secondary,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ETADisplay;
