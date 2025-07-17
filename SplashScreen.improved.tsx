import React, { useState, useEffect } from 'react';
import { jpmcColors } from './jpmcTheme';

interface SplashScreenProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isDarkMode = true }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [message, setMessage] = useState('Initializing JPMC Office Environment...');
  const [isInitializing, setIsInitializing] = useState(true);
  const [splashScreenVisible, setSplashScreenVisible] = useState(true); // Add explicit visibility state

  useEffect(() => {
    let timer: number;
    let interval: number;
    
    console.log("Splash screen mounted and visible:", splashScreenVisible);
    
    // Force visibility
    setSplashScreenVisible(true);

    // Add a small delay for the initial animation
    setTimeout(() => {
      setIsInitializing(false);
      console.log("Splash screen initialization animation complete");
    }, 600);
      // Simulate loading progress - make it even slower to ensure complete loading
    interval = window.setInterval(() => {setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Much longer delay before completing to ensure 3D content is fully ready
          timer = window.setTimeout(() => {
            console.log("Splash screen complete, 3D content should be fully loaded");
            
            // Update visibility state before completion
            setSplashScreenVisible(false);
            
            // Make sure the component is still mounted before calling onComplete
            setTimeout(() => {
              console.log("Calling onComplete callback now");
              onComplete();
            }, 100);
            
          }, 2000); // Longer delay to ensure 3D content is ready
          
          return 100;
        }
        
        // Very slow progress to ensure we don't finish too early
        let increment = 0.7;
        
        // Update loading message based on progress with more detailed steps
        if (prev >= 0 && prev < 15) {
          setMessage('Initializing JPMC Office Environment...');
          increment = 0.5 + (Math.random() * 1);
        } else if (prev >= 15 && prev < 30) {
          setMessage('Loading 3D office floor plan and textures...');
          increment = 0.5 + (Math.random() * 1);
        } else if (prev >= 30 && prev < 45) {
          setMessage('Preparing navigation systems...');
          increment = 0.7 + (Math.random() * 1.2);
        } else if (prev >= 45 && prev < 60) {
          setMessage('Calculating navigation paths and waypoints...');
          increment = 0.8 + (Math.random() * 1.2);
        } else if (prev >= 60 && prev < 75) {
          setMessage('Preparing 3D models and animations...');
          increment = 0.8 + (Math.random() * 1.2);
        } else if (prev >= 75 && prev < 85) {
          setMessage('Optimizing rendering performance...');
          increment = 0.7 + (Math.random() * 1);
        } else if (prev >= 85 && prev < 95) {
          setMessage('Initializing AR capabilities...');
          increment = 0.5 + (Math.random() * 1);
        } else {
          setMessage('Ready to launch JPMC AR Navigation!');
          increment = 0.6 + (Math.random() * 1);
        }
          // Even slower progress increment for smoother loading
        return Math.min(prev + (increment * 0.8), 100); // 20% slower than before
      });
    }, 450); // Even slower interval for loading progress
    
    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [onComplete]);
  // Force visibility with multiple styles to ensure the splash screen shows
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: isDarkMode 
        ? `linear-gradient(135deg, #000911, ${jpmcColors.secondary})` 
        : `linear-gradient(135deg, ${jpmcColors.secondary}, ${jpmcColors.primary})`,
      display: splashScreenVisible ? 'flex' : 'flex', // Always flex
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: jpmcColors.white,
      zIndex: 9999,
      opacity: isInitializing ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      visibility: 'visible', // Force visibility
      pointerEvents: 'auto', // Make sure it captures pointer events
    }}>
      <div style={{
        maxWidth: '80%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          JPMC WayFindAR
        </h1>
        
        <div style={{
          marginBottom: '2rem',
          position: 'relative',
          width: '300px',
          height: '8px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${loadingProgress}%`,
            backgroundColor: isDarkMode ? jpmcColors.primary : jpmcColors.accentOrange,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.8,
        }}>
          {message}
        </p>
        
        <div style={{ marginTop: '3rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: `4px solid ${isDarkMode ? jpmcColors.primary : jpmcColors.accentOrange}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem',
          }} />
          
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
        
        <p style={{
          fontSize: '0.9rem',
          opacity: 0.6,
        }}>
          Powered by Three.js & React
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
