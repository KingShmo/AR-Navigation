import React, { useState, useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';

interface GoogleStyleARViewProps {
  active: boolean;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
  style?: React.CSSProperties;
  opacity?: number;
  isFirstPersonMode?: boolean;
  aspectRatio?: 'cover' | 'contain' | 'fill';
  direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  destination?: string;
  eta?: number;
  distance?: number;
  onToggleViewMode?: () => void;
  isDarkMode?: boolean;
}

// Pulsating animation component
const PulseEffect = ({ children }: { children: React.ReactNode }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.1 : 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      transform: `scale(${scale})`,
      transition: 'transform 0.5s ease-in-out'
    }}>
      {children}
    </div>
  );
};

// Helper component for direction indicator using JPMC colors
const DirectionIndicator = ({ 
  direction = 'forward',
  distance = 50 
}: { 
  direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator'; 
  distance?: number;
}) => {
  // Get color and icon based on direction
  const getDirectionInfo = () => {
    switch (direction) {
      case 'left': return { 
        color: jpmcColors.primary, // JPMC blue
        icon: '←', 
        label: 'Turn left',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        )
      };
      case 'right': return { 
        color: jpmcColors.accentOrange, // JPMC orange
        icon: '→', 
        label: 'Turn right',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        )
      };
      case 'stairs': return { 
        color: jpmcColors.accentGreen, // JPMC green
        icon: '↑↓', 
        label: 'Take stairs',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h-2V9h2V5h2v4h2v4h-2v4z"/>
          </svg>
        )
      };
      case 'elevator': return { 
        color: jpmcColors.accentYellow, // JPMC yellow
        icon: '⬆⬇', 
        label: 'Take elevator',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M7 10l5 5 5-5z"/>
            <path d="M7 14l5-5 5 5z"/>
          </svg>
        )
      };
      default: return { 
        color: jpmcColors.secondary, // JPMC dark blue
        icon: '↑', 
        label: 'Continue straight',
        svg: (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/>
          </svg>
        )
      };
    }
  };
    const { color, label, svg } = getDirectionInfo();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Large direction indicator with pulse effect */}
      <PulseEffect>
        <div style={{
          backgroundColor: color,
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          marginBottom: '10px'
        }}>
          {svg}
        </div>
      </PulseEffect>
      
      {/* Direction text */}
      <div style={{
        color: '#212121',
        fontWeight: 'bold',
        fontSize: '16px',
        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '4px 12px',
        borderRadius: '16px'
      }}>
        {label}
      </div>
      
      {/* Distance */}
      <div style={{
        color: '#5f6368',
        fontSize: '14px',
        marginTop: '4px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '2px 8px',
        borderRadius: '12px'
      }}>
        {distance} ft ahead
      </div>
    </div>
  );
};

const GoogleStyleARView: React.FC<GoogleStyleARViewProps> = ({ 
  active, 
  onCameraReady, 
  onCameraError,
  style = {},
  opacity = 1,
  isFirstPersonMode = false,
  aspectRatio = 'cover',
  direction = 'forward',
  destination = 'Conference Room',
  eta = 120,
  distance = 50,
  onToggleViewMode,
  isDarkMode
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);

  // Get available cameras
  useEffect(() => {
    if (!active) return;

    const getDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          throw new Error('Media devices API not supported');
        }
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        // Default to back camera if available
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          setSelectedCameraId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    
    getDevices();
  }, [active]);
  
  useEffect(() => {
    // Only setup camera if explicitly activated
    if (!active) {
      console.log('GoogleStyleARView: Not active, skipping camera setup');
      return;
    }
    
    console.log('GoogleStyleARView: Camera setup requested, active =', active);
    
    // Add a deliberate delay to ensure the component is fully mounted and give user time to see UI first
    const setupTimer = setTimeout(async () => {
        try {
          // Check if running in a secure context (https or localhost)
          if (!window.isSecureContext) {
            throw new Error('Camera access requires a secure context (HTTPS)');
          }

          // Check for navigator.mediaDevices API
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support camera access');
          }        
          
          // Request camera access with specified device if available
          // More robust camera constraints for better device compatibility
          const constraints = {
            video: selectedCameraId 
              ? { 
                  deviceId: { exact: selectedCameraId },
                  width: { ideal: window.innerWidth },
                  height: { ideal: window.innerHeight },
                  facingMode: 'environment',
                  frameRate: { ideal: 30 }
                }
              : { 
                  facingMode: { ideal: 'environment' }, // Default to back camera with stronger preference
                  width: { ideal: window.innerWidth, min: 320 },
                  height: { ideal: window.innerHeight, min: 240 },
                  frameRate: { ideal: 30, min: 15 }
                }
          };
          
          console.log('Requesting camera with constraints:', JSON.stringify(constraints));
          const videoStream = await navigator.mediaDevices.getUserMedia(constraints);

          setStream(videoStream);
          setPermission('granted');
          if (onCameraReady) onCameraReady();
        } catch (err) {
          console.error('Camera access error:', err);
          setPermission('denied');
          const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
          setErrorMessage(errorMsg);
          if (onCameraError) onCameraError(errorMsg);
        }
    }, 1000); // 1 second delay before attempting camera access
    
    // Cleanup function
    return () => {
      // Clean up the timer
      clearTimeout(setupTimer);
      
      // Stop any active camera stream
      if (stream) {
        console.log('GoogleStyleARView: Cleaning up camera stream');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active, selectedCameraId, onCameraReady, onCameraError]);

  // Handle window orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Restart the camera to adjust to new orientation
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setPermission('pending');
        // Let the second useEffect handle restarting the camera
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [stream]);

  // Don't render anything if not active
  if (!active) return null;

  if (permission === 'denied' || errorMessage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '20px',
        zIndex: 9999,
        textAlign: 'center'
      }}>
        <div style={{
          background: '#1A73E8', // Google Maps style
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '80%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>Camera Access Required</h3>
          <p>{errorMessage || 'Camera permission was denied'}</p>
          <p>This app needs camera access for the AR navigation experience</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'white',
                color: '#1A73E8',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                setErrorMessage(null);
                setPermission('granted');
                // Skip camera and just show AR interface without camera
                if (onCameraReady) onCameraReady();
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Continue Without Camera
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'pending') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#212121',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>📱</div>
          <p>Requesting camera access...</p>
          <div style={{
            width: '50px',
            height: '50px',
            margin: '20px auto',
            border: '4px solid #5f6368',
            borderTopColor: '#1A73E8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Camera permission granted, display video stream with Google Maps style UI
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: isFirstPersonMode ? -1 : 0,
      overflow: 'hidden',
      ...style
    }}>
      <video
        ref={(videoElement) => {
          if (videoElement && stream) {
            // Ensure old srcObject is properly cleaned up
            if (videoElement.srcObject && videoElement.srcObject !== stream) {
              try {
                const oldStream = videoElement.srcObject as MediaStream;
                oldStream.getTracks().forEach(track => track.stop());
              } catch (err) {
                console.error("Error cleaning up old stream:", err);
              }
            }
            
            videoElement.srcObject = stream;
            
            // More robust video playback handling with retry
            const attemptPlay = async () => {
              try {
                await videoElement.play();
                console.log("Camera video playing successfully");
              } catch (err) {
                console.error("Video play error:", err);
                
                // Add a visible alert for permission issues on iOS
                if (/(iPhone|iPad|iPod)/i.test(navigator.userAgent)) {
                  alert("Please grant camera permission. If the camera doesn't appear, try refreshing the page.");
                }
                
                // Retry play after a short delay (useful for some mobile browsers)
                setTimeout(() => {
                  videoElement.play().catch(e => console.error("Retry play failed:", e));
                }, 1000);
              }
            };
            
            attemptPlay();
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: aspectRatio,
          opacity: opacity,
          transform: 'scaleX(-1)', // Mirror horizontally for a more natural AR experience
          WebkitTransform: 'scaleX(-1)',
          backgroundColor: 'transparent' // Ensure background is transparent
        }}
        autoPlay
        playsInline
        muted
      />
      
      {/* Overlay to adjust brightness for better AR visibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.1)', // Slight darkening for better contrast with virtual elements
        pointerEvents: 'none' // Allow clicks to pass through
      }} />        {/* JPMC Style Header */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        backgroundColor: 'white',
        borderRadius: jpmcThemeUI.borderRadius.lg,
        padding: '12px',
        boxShadow: jpmcThemeUI.shadows.md,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 101
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: jpmcColors.primary, 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: jpmcColors.text }}>{destination}</div>
            <div style={{ color: jpmcColors.textLight, fontSize: '14px' }}>
              {Math.floor(eta/60)} min {eta % 60} sec • {distance} ft
            </div>
          </div>
        </div>
        <button 
          onClick={() => {/* Handle navigation end */}} 
          style={{
            backgroundColor: jpmcColors.primary,
            color: jpmcColors.white,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.md,
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.sm
          }}
        >
          End
        </button>
      </div>        {/* JPMC Style Direction Arrow Panel */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: jpmcThemeUI.borderRadius.xl,
          width: '100%',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: jpmcThemeUI.shadows.md,
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: jpmcColors.text
          }}>
            {direction === 'left' ? 'Turn Left' : 
             direction === 'right' ? 'Turn Right' : 
             direction === 'stairs' ? 'Take Stairs' :
             direction === 'elevator' ? 'Take Elevator' : 
             'Continue Straight'}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{
              backgroundColor: (() => {
                switch(direction) {
                  case 'left': return jpmcColors.primary;
                  case 'right': return jpmcColors.accentOrange;
                  case 'stairs': return jpmcColors.accentGreen;
                  case 'elevator': return jpmcColors.accentYellow;
                  default: return jpmcColors.secondary;
                }
              })(),
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              boxShadow: jpmcThemeUI.shadows.sm,
              marginRight: '10px'
            }}>
              {(() => {
                switch (direction) {
                  case 'left': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                  );
                  case 'right': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  );
                  case 'stairs': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h-2V9h2V5h2v4h2v4h-2v4z"/>
                    </svg>
                  );
                  case 'elevator': return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M7 10l5 5 5-5z"/>
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  );
                  default: return (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/>
                    </svg>
                  );
                }
              })()}
            </div>
            
            <div style={{ color: '#5f6368', fontSize: '14px' }}>
              In {distance} feet
            </div>
          </div>
        </div>
      </div>
        {/* JPMC Style Bottom Navigation Circle */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        height: '180px',
        backgroundColor: 'white',
        borderRadius: '50%',
        boxShadow: jpmcThemeUI.shadows.lg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
      }}>
        <DirectionIndicator 
          direction={direction} 
          distance={distance} 
        />
      </div>
        {/* Camera selector if multiple cameras are available */}
      {cameraDevices.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '220px',
          right: '20px',
          zIndex: 102
        }}>
          <button            onClick={() => {
              // Switch to next camera
              const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedCameraId);
              const nextIndex = (currentIndex + 1) % cameraDevices.length;
              setSelectedCameraId(cameraDevices[nextIndex].deviceId);
            }}
            style={{
              backgroundColor: 'white',
              color: jpmcColors.primary,
              border: 'none',
              borderRadius: jpmcThemeUI.borderRadius.round,
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: jpmcThemeUI.shadows.md
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M12 10l-.94 2.06L9 13l2.06.94L12 16l.94-2.06L15 13l-2.06-.94zm8-5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h4.05l.59-.65L9.88 5h4.24l1.24 1.35.59.65H20v12z"/>
            </svg>
          </button>
        </div>
      )}
        {/* JPMC-styled recenter button */}
      <div style={{
        position: 'absolute',
        bottom: '220px',
        left: '20px',
        zIndex: 102
      }}>
        <button 
          style={{
            backgroundColor: 'white',
            color: jpmcColors.primary,
            border: 'none',
            borderRadius: jpmcThemeUI.borderRadius.round,
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: jpmcThemeUI.shadows.md
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={jpmcColors.primary}>
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>      </div>
      
      {/* Toggle to 3D View button */}
      {onToggleViewMode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 102
        }}>
          <button 
            onClick={onToggleViewMode}
            style={{
              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
              border: 'none',
              borderRadius: jpmcThemeUI.borderRadius.md,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: jpmcThemeUI.shadows.md,
              transition: jpmcThemeUI.transitions.medium,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isDarkMode ? jpmcColors.white : jpmcColors.primary}>
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
            Switch to 3D View
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleStyleARView;
