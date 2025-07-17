import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import TWEEN from '@tweenjs/tween.js';
import MobileCameraView from './MobileCameraView.enhanced';
import ARDirectionIndicator from './ARDirectionIndicator';

// Camera and movement controls for first person navigation
const CameraControls = ({ direction }: { direction?: string }) => {
  // Direction param is reserved for future directional guidance features
  const { camera } = useThree();
  const [rotationY, setRotationY] = useState(0);
  const [lookY, setLookY] = useState(1.7); // Eye level
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  type KeysType = {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    arrowUp: boolean;
    arrowLeft: boolean;
    arrowDown: boolean;
    arrowRight: boolean;
    [key: string]: boolean;
  };
  
  const keys = useRef<KeysType>({
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
  }, [camera]);
  
  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = true;
      }
      
      // Handle arrow keys too
      if (e.key === 'ArrowUp') keys.current.arrowUp = true;
      if (e.key === 'ArrowDown') keys.current.arrowDown = true;
      if (e.key === 'ArrowLeft') keys.current.arrowLeft = true;
      if (e.key === 'ArrowRight') keys.current.arrowRight = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = false;
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
    
    // Add virtual joystick for movement on mobile - simplified for stability
    const createVirtualJoystick = () => {
      // We'll use on-screen buttons for WASD-like control on mobile
      const joystickContainer = document.createElement('div');
      joystickContainer.id = 'virtual-joystick';
      joystickContainer.style.position = 'absolute';
      joystickContainer.style.bottom = '20px';
      joystickContainer.style.left = '20px';
      joystickContainer.style.zIndex = '1000';
      joystickContainer.style.display = 'flex';
      joystickContainer.style.flexDirection = 'column';
      joystickContainer.style.gap = '10px';
      
      // Up button
      const upBtn = document.createElement('button');
      upBtn.textContent = '↑';
      upBtn.style.width = '60px';
      upBtn.style.height = '60px';
      upBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      upBtn.style.color = 'black';
      upBtn.style.border = 'none';
      upBtn.style.borderRadius = '50%';
      upBtn.style.fontSize = '24px';
      upBtn.style.fontWeight = 'bold';
      upBtn.style.display = 'flex';
      upBtn.style.justifyContent = 'center';
      upBtn.style.alignItems = 'center';
      upBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      
      upBtn.addEventListener('touchstart', () => { keys.current.w = true; });
      upBtn.addEventListener('touchend', () => { keys.current.w = false; });
      
      joystickContainer.appendChild(upBtn);
      
      document.body.appendChild(joystickContainer);
      
      return () => {
        if (document.body.contains(joystickContainer)) {
          document.body.removeChild(joystickContainer);
        }
      };
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    // Create virtual joystick for movement
    const cleanupJoystick = createVirtualJoystick();
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      cleanupJoystick();
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
// First person environment with 3D office elements - Google Maps style
const FirstPersonEnvironment = ({ direction = 'forward', isARMode = false }: { direction?: string, isARMode?: boolean }) => {
  // Direction param will be used for future directional rendering
  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
    
  }, [isMobile, isARMode]);
  
  // Set hasMounted after component mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <>
      {/* Mobile camera view for AR mode */}
      {useMobileCamera && hasMounted && (
        <MobileCameraView 
          active={useMobileCamera} 
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
      
      {/* Direction arrow in Google Maps style */}
      <group position={[0, 1.5, -3]}>
        <mesh>
          <boxGeometry args={[0.3, 0.3, 1.5]} />
        <mesh position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 1, 32]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.3} />
        </mesh>
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </>
  );
};

// Main First Person Navigation Component
interface FirstPersonNavigationProps {
// Main First Person Navigation Component
interface FirstPersonNavigationProps {
  destination?: string;
  etaSeconds?: number;
  isDarkMode?: boolean;
  arrowDirection?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  currentWaypoint?: number;
}

const FirstPersonNavigation: React.FC<FirstPersonNavigationProps> = ({
  destination = "Meeting Room A",
  etaSeconds = 180,
  arrowDirection = 'forward'
}) => {
  // Detect if we're on a mobile device for conditional rendering
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [isARMode, setIsARMode] = useState(false); // Start in normal mode by default
  const [showInfo, setShowInfo] = useState(true);
  
  // Calculate distance based on ETA
  const distance = Math.round(etaSeconds / 20); // Rough estimate: 20 seconds per meter
  
  // Get network URL for sharing
  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    setNetworkUrl(`http://${hostname}:${port}`);
  }, []);
  
  // Toggle AR mode on/off
  const toggleARMode = () => {
    setIsARMode(prev => !prev);
  };
  
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#f8f9fa' }}>
      {/* First-person 3D view canvas */}
      <Canvas 
        style={{ 
          background: isARMode ? 'transparent' : '#f8f9fa',
          position: 'relative', 
          zIndex: 1 
        }}
        gl={{ alpha: isARMode, antialias: true }}
      >
        <FirstPersonEnvironment 
          direction={arrowDirection}
          isARMode={isARMode}
        />
        <CameraControls direction={arrowDirection} />
      </Canvas>
      
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
      
      {/* Return to 3D View Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#1A73E8',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Return to 3D View
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
    </div>
  );
};

export default FirstPersonNavigation;
