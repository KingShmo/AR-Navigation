import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { jpmcColors } from './jpmcTheme';
import TWEEN from '@tweenjs/tween.js';
import MobileCameraView from './MobileCameraView.enhanced';
import ViewModeToggle from './ViewModeToggle';

// Camera and movement controls for first person navigation
const CameraControls: React.FC<{direction: string}> = ({ direction }) => {
  const { camera } = useThree();
  const [rotationY, setRotationY] = useState(0);
  const [lookY, setLookY] = useState(1.7); // Eye level
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowLeft: false,
    arrowDown: false,
    arrowRight: false
  });
  
  // Initialize camera position
  useEffect(() => {
    camera.position.set(position.x, lookY, position.z);
  }, [camera, position.x, position.z, lookY]);
  
  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
      
      // Handle arrow keys too
      if (e.key === 'ArrowUp') keys.current.arrowUp = true;
      if (e.key === 'ArrowDown') keys.current.arrowDown = true;
      if (e.key === 'ArrowLeft') keys.current.arrowLeft = true;
      if (e.key === 'ArrowRight') keys.current.arrowRight = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
      
      // Handle arrow keys too
      if (e.key === 'ArrowUp') keys.current.arrowUp = false;
      if (e.key === 'ArrowDown') keys.current.arrowDown = false;
      if (e.key === 'ArrowLeft') keys.current.arrowLeft = false;
      if (e.key === 'ArrowRight') keys.current.arrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Handle touch controls for mobile devices
  useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        const deltaX = touchX - touchStart.current.x;
        const deltaY = touchY - touchStart.current.y;
        
        // Update rotation based on horizontal movement (more sensitive)
        setRotationY(prev => prev - deltaX * 0.01);
        
        // Update vertical look position (limited range)
        setLookY(prev => {
          const newY = prev - deltaY * 0.01;
          return Math.max(0.5, Math.min(3, newY)); // Clamp between 0.5 and 3
        });
        
        // Reset touch start position for continuous movement
        touchStart.current = { x: touchX, y: touchY };
      }
    };
      // Add simple touch controls for mobile in Google Maps style
    const createMobileControls = () => {
      // Create a container for all mobile controls
      const controlsContainer = document.createElement('div');
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.bottom = '100px';
      controlsContainer.style.left = '0';
      controlsContainer.style.right = '0';
      controlsContainer.style.display = 'flex';
      controlsContainer.style.justifyContent = 'center';
      controlsContainer.style.alignItems = 'center';
      controlsContainer.style.zIndex = '1000';
      controlsContainer.style.pointerEvents = 'none'; // Make container transparent to clicks
      
      // Create a floating button for forward movement
      const forwardBtn = document.createElement('button');
      forwardBtn.textContent = '↑';
      forwardBtn.style.width = '70px';
      forwardBtn.style.height = '70px';
      forwardBtn.style.backgroundColor = '#1A73E8';
      forwardBtn.style.color = 'white';
      forwardBtn.style.border = 'none';
      forwardBtn.style.borderRadius = '50%';
      forwardBtn.style.fontSize = '28px';
      forwardBtn.style.fontWeight = 'bold';
      forwardBtn.style.display = 'flex';
      forwardBtn.style.justifyContent = 'center';
      forwardBtn.style.alignItems = 'center';
      forwardBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      forwardBtn.style.margin = '0 10px';
      forwardBtn.style.pointerEvents = 'auto'; // Make button clickable
      
      // Add look left/right buttons for easier rotation on mobile
      const leftBtn = document.createElement('button');
      leftBtn.textContent = '←';
      leftBtn.style.width = '50px';
      leftBtn.style.height = '50px';
      leftBtn.style.backgroundColor = 'white';
      leftBtn.style.color = '#1A73E8';
      leftBtn.style.border = 'none';
      leftBtn.style.borderRadius = '50%';
      leftBtn.style.fontSize = '22px';
      leftBtn.style.fontWeight = 'bold';
      leftBtn.style.display = 'flex';
      leftBtn.style.justifyContent = 'center';
      leftBtn.style.alignItems = 'center';
      leftBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      leftBtn.style.pointerEvents = 'auto'; // Make button clickable
      
      const rightBtn = document.createElement('button');
      rightBtn.textContent = '→';
      rightBtn.style.width = '50px';
      rightBtn.style.height = '50px';
      rightBtn.style.backgroundColor = 'white';
      rightBtn.style.color = '#1A73E8';
      rightBtn.style.border = 'none';
      rightBtn.style.borderRadius = '50%';
      rightBtn.style.fontSize = '22px';
      rightBtn.style.fontWeight = 'bold';
      rightBtn.style.display = 'flex';
      rightBtn.style.justifyContent = 'center';
      rightBtn.style.alignItems = 'center';
      rightBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      rightBtn.style.pointerEvents = 'auto'; // Make button clickable
      
      // Add touch event listeners for smoother control
      forwardBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); // Prevent default behavior
        keys.current.w = true; 
      });
      forwardBtn.addEventListener('touchend', () => { keys.current.w = false; });
      
      // Rotation controls with continuous rotation while pressed
      let leftInterval: number;
      leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftInterval = window.setInterval(() => {
          setRotationY(prev => prev + 0.05); // Rotate left
        }, 16); // ~60fps
      });
      leftBtn.addEventListener('touchend', () => {
        window.clearInterval(leftInterval);
      });
      
      let rightInterval: number;
      rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightInterval = window.setInterval(() => {
          setRotationY(prev => prev - 0.05); // Rotate right
        }, 16); // ~60fps
      });
      rightBtn.addEventListener('touchend', () => {
        window.clearInterval(rightInterval);
      });
      
      // Assemble the controls
      controlsContainer.appendChild(leftBtn);
      controlsContainer.appendChild(forwardBtn);
      controlsContainer.appendChild(rightBtn);
      
      document.body.appendChild(controlsContainer);
      
      return () => {
        if (document.body.contains(controlsContainer)) {
          document.body.removeChild(controlsContainer);
        }
        // Clear any running intervals for safety
        if (typeof leftInterval !== 'undefined') window.clearInterval(leftInterval);
        if (typeof rightInterval !== 'undefined') window.clearInterval(rightInterval);
      };
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    // Create mobile controls
    const cleanupControls = createMobileControls();
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      cleanupControls();
    };
  }, [isMobile]);
  
  // Update camera position and rotation in each frame
  useFrame((_, delta) => {
    // Process WASD keyboard and touch controls movement
    const moveSpeed = 3 * delta;
    let moveX = 0;
    let moveZ = 0;
    
    if (keys.current.w || keys.current.arrowUp) moveZ -= moveSpeed;
    if (keys.current.s || keys.current.arrowDown) moveZ += moveSpeed;
    if (keys.current.a || keys.current.arrowLeft) moveX -= moveSpeed;
    if (keys.current.d || keys.current.arrowRight) moveX += moveSpeed;
    
    // Apply movement based on current camera rotation
    if (moveX !== 0 || moveZ !== 0) {
      const angle = rotationY;
      const newX = position.x + (moveX * Math.cos(angle) + moveZ * Math.sin(angle));
      const newZ = position.z + (moveZ * Math.cos(angle) - moveX * Math.sin(angle));
      
      // Update position
      setPosition({ x: newX, z: newZ });
    }
    
    // Update TWEEN animations
    TWEEN.update();
    
    // Update camera position and rotation
    camera.position.x = position.x;
    camera.position.y = lookY; // Eye level
    camera.position.z = position.z;
    
    // Apply rotation
    camera.rotation.y = rotationY;
  });
  
  return null;
};

// First person environment with 3D office elements - Google Maps style
const FirstPersonEnvironment: React.FC<{direction: string, isARMode: boolean}> = ({ 
  direction = 'forward', 
  isARMode = false 
}) => {
  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [useMobileCamera, setUseMobileCamera] = useState(isMobile && isARMode);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Colors - Google Maps style (light, clean colors)
  const colors = {
    floor: '#E8E8E8',
    wall: '#F4F4F4',
    accent: '#1A73E8', // Google blue
    emissive: '#4285F4',
    emissiveIntensity: 0.1
  };
  
  // Handle device orientation for mobile AR mode
  useEffect(() => {
    if (!isMobile || !isARMode) return;
    
    // Enable mobile camera for AR mode
    setUseMobileCamera(true);
    
    // Add device orientation support for more immersive AR
    let deviceOrientationPermissionGranted = false;
    
    // Request device orientation permission on iOS 13+
    const requestOrientationPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceOrientationEvent as any).requestPermission();
          deviceOrientationPermissionGranted = permissionState === 'granted';
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        // Non-iOS devices don't need permission
        deviceOrientationPermissionGranted = true;
      }
    };
    
    // Try to request permission
    requestOrientationPermission();
  }, [isMobile, isARMode]);
  
  // Set hasMounted after component mount
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return (
    <>
      {/* Mobile camera view for AR mode - only if we're in AR mode and mounted */}
      {useMobileCamera && hasMounted && (
        <MobileCameraView 
          active={useMobileCamera && isARMode} // Only activate when explicitly in AR mode
          opacity={0.9}
          isFirstPersonMode={true}
          aspectRatio="cover"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0
          }}
        />
      )}
      
      {/* Office environment - Google Maps style with light colors */}
      <ambientLight intensity={0.8} />
      
      {/* Main light */}
      <spotLight 
        position={[0, 5, 0]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        color="#FFFFFF"
      />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color={colors.floor} 
          roughness={0.8} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color={colors.floor} 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Direction arrow in Google Maps style */}      <group position={[0, 1.5, -3]}>
        <mesh>
          <boxGeometry args={[0.3, 0.3, 1.5]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 1, 32]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </>
  );
};

// Google Maps style navigation component
interface GoogleMapsNavigationProps {
  destination?: string;
  etaSeconds?: number;
  arrowDirection?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  onToggleViewMode?: () => void;
  isDarkMode?: boolean;
}

const GoogleMapsNavigation: React.FC<GoogleMapsNavigationProps> = ({
  destination = "Meeting Room A",
  etaSeconds = 180,
  arrowDirection = 'forward',
  onToggleViewMode,
  isDarkMode = false
}) => {
  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [isARMode, setIsARMode] = useState(false); // Start in normal mode by default
  const [arEnabled, setArEnabled] = useState(false); // Additional control for AR/camera activation
  const [showInfo, setShowInfo] = useState(true);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [networkUrl, setNetworkUrl] = useState('');
  
  // Force initialization in non-AR mode
  useEffect(() => {
    console.log("GoogleMapsNavigation: Initializing in non-AR mode");
    setIsARMode(false);
    setArEnabled(false);
    
    // Short delay before allowing AR mode to be enabled
    const timer = setTimeout(() => {
      console.log("GoogleMapsNavigation: AR now available if needed");
      setArEnabled(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate distance based on ETA
  const distance = Math.round(etaSeconds / 20); // Rough estimate: 20 seconds per meter
  
  // Get network URL for sharing
  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    setNetworkUrl(`http://${hostname}:${port}`);
    
    // For JPMC corporate network
    if (hostname === 'localhost') {
      setNetworkUrl(`http://10.105.132.50:${port}`);
    }
  }, []);
  // Toggle AR mode on/off
  const toggleARMode = () => {
    console.log("GoogleMapsNavigation: Toggle AR mode requested, arEnabled =", arEnabled);
    
    // Only allow AR mode if explicitly enabled
    if (!arEnabled) {
      console.log("GoogleMapsNavigation: AR mode not yet available, ignoring toggle request");
      return;
    }
    
    // If there's an external toggle function, use that
    if (onToggleViewMode) {
      console.log("GoogleMapsNavigation: Using external toggle view mode");
      onToggleViewMode();
    } else {
      // Otherwise, use internal toggle as fallback
      console.log("GoogleMapsNavigation: Using internal AR mode toggle");
      setIsARMode(prev => !prev);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#f8f9fa' }}>      {/* First-person 3D view canvas */}      <Canvas 
        style={{ 
          background: isARMode && arEnabled ? 'transparent' : '#f8f9fa',
          position: 'relative', 
          zIndex: 1 
        }}
        gl={{ alpha: isARMode && arEnabled, antialias: true }}
      >
        <FirstPersonEnvironment 
          direction={arrowDirection}
          isARMode={isARMode && arEnabled} // Only enable AR features when explicitly enabled
        />
        <CameraControls direction={arrowDirection} />
      </Canvas>

      {/* View Mode Toggle Button */}
      {onToggleViewMode && (
        <ViewModeToggle 
          isARMode={true} 
          toggleViewMode={onToggleViewMode}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Google Maps style UI */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '0',
          right: '0',
          background: 'white',
          color: '#202124',
          padding: '15px',
          margin: '0 10px',
          borderRadius: '8px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          zIndex: 100,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#1A73E8',
            color: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
            marginRight: '15px'
          }}>
            {arrowDirection === 'forward' ? '↑' :
             arrowDirection === 'left' ? '←' :
             arrowDirection === 'right' ? '→' :
             arrowDirection === 'stairs' ? '↗' : '↑'}
          </div>
          <div style={{flex: 1}}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>
              {destination}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span>{distance} meters • </span>
              <span style={{marginLeft: '5px'}}>
                {Math.floor(etaSeconds / 60)}:{String(etaSeconds % 60).padStart(2, '0')} min
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom control bar (Google Maps style) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        zIndex: 100
      }}>
        <button 
          style={{
            background: 'white',
            color: isARMode ? '#1A73E8' : '#202124',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={toggleARMode}
        >
          {isARMode ? '🌍' : '📷'}
        </button>
        
        <button 
          style={{
            background: 'white',
            color: showInfo ? '#1A73E8' : '#202124',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? 'ℹ️' : 'ℹ️'}
        </button>
        
        <button 
          style={{
            background: 'white',
            color: '#202124',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => setShowNetworkInfo(!showNetworkInfo)}
        >
          {showNetworkInfo ? '🔌' : '🔌'}
        </button>
      </div>

      {/* Network Info Display - Google Style */}
      {showNetworkInfo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          color: '#202124',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '90%',
          width: '350px',
          zIndex: 110,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Network Connection</span>
            <span 
              style={{cursor: 'pointer'}}
              onClick={() => setShowNetworkInfo(false)}
            >×</span>
          </div>
          <div style={{ 
            fontSize: '0.95rem',
            padding: '10px',
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            wordBreak: 'break-all'
          }}>
            {networkUrl}
          </div>
          <div style={{
            marginTop: '15px',
            fontSize: '0.85rem',
            color: '#5f6368'
          }}>
            Open this URL on your mobile device to access the app
          </div>
        </div>
      )}
      
      {/* Instructions - temporarily shown */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        color: '#202124',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '80%',
        zIndex: 100,
        textAlign: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Navigation Controls
        </div>
        <div style={{ fontSize: '0.9rem', color: '#5f6368' }}>
          {isMobile ? (
            <>Tap the blue button to move • Swipe to look around</>
          ) : (
            <>Use WASD or Arrow Keys to move • Mouse to look around</>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsNavigation;
