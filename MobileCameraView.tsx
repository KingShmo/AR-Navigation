import React, { useState, useEffect } from 'react';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';

interface MobileCameraViewProps {
  active: boolean;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
  style?: React.CSSProperties;
  opacity?: number;
  isFirstPersonMode?: boolean;
}

const MobileCameraView: React.FC<MobileCameraViewProps> = ({ 
  active, 
  onCameraReady, 
  onCameraError,
  style = {},
  opacity = 1,
  isFirstPersonMode = false
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    
    async function setupCamera() {
      try {
        // Check if running in a secure context (https or localhost)
        if (!window.isSecureContext) {
          throw new Error('Camera access requires a secure context (HTTPS)');
        }

        // Check for navigator.mediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support camera access');
        }

        // Request camera access
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use the back camera on mobile devices
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          }
        });

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
    }

    setupCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active, onCameraReady, onCameraError]);

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
        color: jpmcColors.white,
        padding: '20px',
        zIndex: 9999,
        textAlign: 'center'
      }}>
        <div style={{
          background: jpmcColors.dark,
          padding: '20px',
          borderRadius: jpmcThemeUI.borderRadius.md,
          maxWidth: '80%',
          boxShadow: jpmcThemeUI.shadows.lg,
        }}>
          <h3 style={{ color: jpmcColors.accentRed, marginTop: 0 }}>Camera Access Error</h3>
          <p>{errorMessage || 'Camera permission was denied'}</p>
          <p>This app needs camera access for the AR experience</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: jpmcColors.primary,
              color: jpmcColors.white,
              border: 'none',
              padding: '10px 15px',
              borderRadius: jpmcThemeUI.borderRadius.sm,
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Try Again
          </button>
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
        backgroundColor: jpmcColors.dark,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: jpmcColors.white,
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>📱</div>
          <p>Requesting camera access...</p>
          <div style={{
            width: '50px',
            height: '50px',
            margin: '20px auto',
            border: `4px solid ${jpmcColors.gray}`,
            borderTopColor: jpmcColors.primary,
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
  // Camera permission granted, display video stream
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1 // Behind the 3D content
    }}>
      <video
        ref={(videoElement) => {
          if (videoElement && stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch(err => console.error("Video play error:", err));
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror horizontally for more natural AR experience
          WebkitTransform: 'scaleX(-1)'
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
        background: 'rgba(0, 0, 0, 0.15)', // Slight darkening for better contrast with virtual elements
        pointerEvents: 'none' // Allow clicks to pass through
      }} />
    </div>
  );
};

export default MobileCameraView;
