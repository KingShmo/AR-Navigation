import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, useGLTF, Html } from '@react-three/drei';
import ARControls from './ARControls';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';
import TWEEN from '@tweenjs/tween.js';
import PulsatingArrow from './PulsatingArrow';
import MobileCameraView from './MobileCameraView';
import { officeImages } from './assets/office-images';

// Arrow indicator pointing to destination
// Enhanced directional arrow with pulsating effect
const DirectionalArrow = ({
  position,
  rotation,
  direction = 'forward'
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  direction?: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
}) => {
  const [scale, setScale] = useState(1);

  // Pulsating animation effect
  useEffect(() => {
    const pulsate = () => {
      setScale((prevScale) => {
        // Oscillate between 0.9 and 1.2
        if (prevScale >= 1.2) return 0.9;
        return prevScale + 0.01;
      });
    };

    const interval = setInterval(pulsate, 40);
    return () => clearInterval(interval);
  }, []);

  // Color based on direction
  const getDirectionColor = () => {
    switch (direction) {
      case 'left': return jpmcColors.accentBlue;
      case 'right': return jpmcColors.accentOrange;
      case 'stairs': return jpmcColors.accentGreen;
      case 'elevator': return jpmcColors.accentYellow;
      default: return jpmcColors.primary;
    }
  };

  const arrowColor = getDirectionColor();

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh>
        <coneGeometry args={[0.2, 0.5, 32]} />
        <meshStandardMaterial 
          color={arrowColor} 
          emissive={arrowColor} 
          emissiveIntensity={0.5} 
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial 
          color={arrowColor}
          emissive={arrowColor} 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </group>
  );
};

// Path visualization
const NavigationPath = ({ points }: { points: Array<{ x: number; y: number; z: number }> }) => {
  // Create the line once on mount with initial points
  const lineRef = useRef<THREE.Line>(null);
  
  // Use useMemo to avoid recreating the line on every render
  const initialLine = React.useMemo(() => {
    if (!points || points.length < 2) {
      // Return a minimal valid line to avoid errors
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 0.001)
        ]),
        new THREE.LineBasicMaterial({ color: jpmcColors.highlight || '#0073e6', linewidth: 3 })
      );
    }
    
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, p.z))
      ),
      new THREE.LineBasicMaterial({ color: jpmcColors.highlight || '#0073e6', linewidth: 3 })
    );
  }, []);
  
  // Update the line geometry when points change
  useEffect(() => {
    if (!lineRef.current || !points || points.length < 2) return;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    lineRef.current.geometry.dispose(); // Clean up old geometry
    lineRef.current.geometry = geometry;
  }, [points]);

  return <primitive ref={lineRef} object={initialLine} />;
};

// Floor grid with clickable navigation
interface NavigableFloorProps {
    onNavigate: (point: { x: number; y: number; z: number }) => void;
}

interface FloorClickEvent {
    stopPropagation: () => void;
    point: { x: number; y: number; z: number };
}

const NavigableFloor = ({ onNavigate }: NavigableFloorProps) => {
  const floorSize = 20;
  const gridDivisions = 20;

const handleClick = (event: FloorClickEvent) => {
    // Prevent event propagation
    event.stopPropagation();
    
    // Get click position on the floor
    const { point } = event;
    if (onNavigate) onNavigate(point);
};
  
  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        onClick={handleClick}
        receiveShadow
      >
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial 
          color={jpmcColors.gray} 
          opacity={0.8}
          transparent={true}
          roughness={0.8}
        />
      </mesh>
      <gridHelper 
        args={[floorSize, gridDivisions, jpmcColors.grayDark, jpmcColors.gray]} 
        position={[0, 0.01, 0]}
      />
    </group>
  );
};

// Location Label that appears above a location
interface LocationLabelProps {
  position: { x: number; y: number; z: number };
  text: string;
}

const LocationLabel: React.FC<LocationLabelProps> = ({ position, text }) => {
  return (
    <group position={[position.x, position.y + 3.2, position.z]}>
      <Text
        color={jpmcColors.white}
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={jpmcColors.secondary}
      >
        {text}
      </Text>
    </group>
  );
};

// Office furniture and structures
const OfficeEnvironment = ({ locations }: { locations: Array<{ name: string; position: { x: number; y: number; z: number } }> }) => {
  return (
    <group>
      {/* Main office walls */}
      <mesh position={[0, 2, -10]} receiveShadow castShadow>
        <boxGeometry args={[20, 4, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[-10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Meeting room */}
      <group position={[-5, 0, -7]}>
        <mesh position={[0, 1.5, 2]} receiveShadow castShadow>
          <boxGeometry args={[6, 3, 0.2]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[-3, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 3, 4]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[0, 1.5, -2]} receiveShadow castShadow>
          <boxGeometry args={[6, 3, 0.2]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Conference table */}
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Sign */}
        <mesh position={[0, 2.7, 2.05]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color={jpmcColors.primary} />
        </mesh>
      </group>
      
      {/* Desks and workspaces */}
      {[
        [2, -3], [4, -3], [6, -3],
        [2, -1], [4, -1], [6, -1]
      ].map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          {/* Desk */}
          <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
            <boxGeometry args={[1.2, 0.05, 0.8]} />
            <meshStandardMaterial color="#D2B48C" />
          </mesh>
          
          {/* Monitor */}
          <mesh position={[0, 0.7, -0.2]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.3, 0.05]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          
          {/* Chair */}
          <mesh position={[0, 0.25, 0.5]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.05, 0.5]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <mesh position={[0, 0.5, 0.75]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.5, 0.05]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}
      
      {/* Cafeteria */}
      <group position={[7, 0, -8]}>
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[5, 3, 4]} />
          <meshStandardMaterial color="#f0f0f0" opacity={0.5} transparent={true} />
        </mesh>
        
        {/* Cafeteria sign */}
        <mesh position={[0, 2.7, 2]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color={jpmcColors.accentGreen} />
        </mesh>
      </group>
      
      {/* Executive office */}
      <group position={[7, 0, 7]}>
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#f0f0f0" opacity={0.5} transparent={true} />
        </mesh>
        
        {/* Executive sign */}
        <mesh position={[0, 2.7, 2]} receiveShadow>
          <boxGeometry args={[2.5, 0.6, 0.1]} />
          <meshStandardMaterial color={jpmcColors.secondary} />
        </mesh>
      </group>
      
      {/* Starbucks */}
      <group position={[-7, 0, 7]}>
        <mesh position={[0, 1, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color="#00704A" opacity={0.7} transparent={true} />
        </mesh>
        
        {/* Starbucks sign */}
        <mesh position={[0, 2.2, 1.55]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color="#00704A" />
        </mesh>
      </group>
      
      {/* Location labels */}
      {locations?.map((location) => (
        <LocationLabel 
          key={location.name}
          position={location.position}
          text={location.name}
        />
      ))}
    </group>
  );
};

// User avatar that moves to clicked positions
interface UserAvatarProps {
  position: { x: number; y: number; z: number };
  destination?: { x: number; y: number; z: number } | null;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ position, destination }) => {
  const ref = useRef<THREE.Group>(null);
  const positionRef = useRef({ 
    x: position.x, 
    y: position.y, 
    z: position.z 
  });
  const tweenRef = useRef<TWEEN.Tween<{x: number; y: number; z: number}> | null>(null);
  
  // Initialize position
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(position.x, position.y, position.z);
    }
  }, []);
  
  // Handle animation with TWEEN - ensure we don't create a new tween on every render
  useEffect(() => {
    if (destination && ref.current) {
      // Cancel existing tween if any
      if (tweenRef.current) {
        tweenRef.current.stop();
      }
      
      // Create new tween
      tweenRef.current = new TWEEN.Tween(positionRef.current)
        .to({ x: destination.x, y: destination.y, z: destination.z }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          if (ref.current) {
            ref.current.position.x = positionRef.current.x;
            ref.current.position.z = positionRef.current.z;
          }
        })
        .start();
    }
    
    // Cleanup function
    return () => {
      if (tweenRef.current) {
        tweenRef.current.stop();
      }
    };
  }, [destination]); // Remove currentPos from deps to avoid re-creating tween
  
  // Update TWEEN on each frame
  useFrame(() => {
    TWEEN.update();
  });
  
  return (
    <group ref={ref} position={[position.x, position.y, position.z]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 16]} />
        <meshStandardMaterial color={jpmcColors.primary} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.8, 16]} />
        <meshStandardMaterial color={jpmcColors.primary} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.25, 1.2, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={jpmcColors.primary} />
      </mesh>
      <mesh position={[-0.25, 1.2, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={jpmcColors.primary} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color={jpmcColors.secondary} />
      </mesh>
      <mesh position={[-0.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color={jpmcColors.secondary} />
      </mesh>
      
      {/* Direction indicator above head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={jpmcColors.accentOrange} emissive={jpmcColors.accentOrange} emissiveIntensity={0.5} />
      </mesh>
      
      {/* User label */}
      <Html position={[0, 2.2, 0]} center>
        <div style={{
          backgroundColor: jpmcColors.primary,
          color: jpmcColors.white,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}>
          YOU ARE HERE
        </div>
      </Html>
    </group>
  );
};

// Destination marker that appears when clicking
type MarkerPosition = { x: number; y: number; z: number } | null;

const DestinationMarker: React.FC<{ position: MarkerPosition }> = ({ position }) => {
  // Use refs for animation values instead of state to avoid re-renders
  const opacityRef = useRef(1);
  const scaleRef = useRef(1);
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Materials references to avoid re-creating materials
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Initialize materials once
  useEffect(() => {
    if (ref.current && !materialRef.current) {
      materialRef.current = ref.current.material as THREE.MeshStandardMaterial;
    }
    
    if (glowRef.current && !glowMaterialRef.current) {
      glowMaterialRef.current = glowRef.current.material as THREE.MeshStandardMaterial;
    }
  }, []);

  // Pulsing animation for the marker - avoid setState in useFrame
  useFrame(() => {
    if (!ref.current) return;
    
    // Calculate new values
    opacityRef.current = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
    scaleRef.current = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    
    // Apply directly to material and mesh without setState
    if (materialRef.current) {
      materialRef.current.opacity = opacityRef.current;
    }
    
    // Apply scale directly to the mesh
    ref.current.scale.set(scaleRef.current, 1, scaleRef.current);
    
    // Update glow effect
    if (glowRef.current && glowMaterialRef.current) {
      glowRef.current.scale.set(scaleRef.current + 0.5, 1, scaleRef.current + 0.5);
      glowMaterialRef.current.opacity = opacityRef.current * 0.5;
    }
  });

  if (!position) return null;

  return (
    <group position={[position.x, 0.02, position.z]}>
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          color={jpmcColors.primary}
          transparent={true}
          opacity={0.3}
          emissive={jpmcColors.primary}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Main marker */}
      <mesh ref={ref} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial
          color={jpmcColors.primary}
          transparent={true}
          opacity={opacity}
          emissive={jpmcColors.primary}
          emissiveIntensity={0.5}
        />
        
        {/* Destination text with enhanced styling */}
        <Html position={[0, 0.8, 0]} center>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: jpmcColors.white,
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            boxShadow: `0 0 10px ${jpmcColors.primary}`,
            borderLeft: `3px solid ${jpmcColors.primary}`,
            backdropFilter: 'blur(5px)'
          }}>
            DESTINATION
          </div>
        </Html>
      </mesh>
    </group>
  );
};

// Main scene
interface SceneProps {
  destination: { x: number; y: number; z: number } | null;
  onNavigate: (point: { x: number; y: number; z: number }) => void;
  locations: Array<{ name: string; position: { x: number; y: number; z: number }>};
  navMode: NavigationMode;
  controlsRef: React.RefObject<any>;
  etaSeconds?: number;
  isDarkMode?: boolean;
}

const Scene: React.FC<SceneProps> = ({ 
  destination, 
  onNavigate, 
  locations, 
  navMode, 
  controlsRef, 
  etaSeconds,
  isDarkMode = true
}) => {
  const avatarPosition = { x: 0, y: 0, z: 0 };
  const [navPoints, setNavPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);
  
  // Determine direction type based on position and destination
  const getDirectionType = (): 'forward' | 'left' | 'right' | 'stairs' | 'elevator' => {
    if (!destination) return 'forward';
    
    // Simple direction logic - could be more sophisticated in a real implementation
    const dx = destination.x - avatarPosition.x;
    const dz = destination.z - avatarPosition.z;
    
    // Check if we're significantly moving in x or z direction
    const absX = Math.abs(dx);
    const absZ = Math.abs(dz);
    
    // Special cases for navigation mode
    if (navMode === 'stairs') return 'stairs';
    if (navMode === 'elevator') return 'elevator';
    
    // Determine horizontal direction
    if (absX > absZ) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dz < 0 ? 'forward' : 'forward'; // Both cases forward for simplicity
    }
  };

  useEffect(() => {
    if (destination) {
      // Create path points from current position to destination
      setNavPoints([
        { x: avatarPosition.x, y: 0.1, z: avatarPosition.z },
        { x: destination.x, y: 0.1, z: destination.z }
      ]);
    }
  }, [destination]);
  
  return (
    <>
      {/* Lighting adjusted for dark mode */}
      <ambientLight intensity={isDarkMode ? 0.4 : 0.6} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={isDarkMode ? 0.6 : 0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Add fog for depth in dark mode */}
      {isDarkMode && <fog attach="fog" args={['#121212', 10, 40]} />}
      
      <OrbitControls 
        ref={controlsRef}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.05}
      />
      
      <Environment preset={isDarkMode ? "night" : "city"} />
      
      <NavigableFloor onNavigate={onNavigate} />
      <OfficeEnvironment locations={locations} />
      
      {destination && (
        <>
          <NavigationPath points={navPoints} />
          <DestinationMarker position={destination} />
          <DirectionalArrow 
            position={[
              avatarPosition.x + (destination.x - avatarPosition.x) * 0.3, 
              1.5, 
              avatarPosition.z + (destination.z - avatarPosition.z) * 0.3
            ]}
            rotation={[0, Math.atan2(destination.x - avatarPosition.x, destination.z - avatarPosition.z), 0]}
            direction={getDirectionType()}
          />
        </>
      )}
      
      <UserAvatar position={avatarPosition} destination={destination} />
    </>
  );
};

interface ARNavigation2Props {
  destinations: Array<{
    name: string;
    position: { x: number; y: number; z: number };
    etaSeconds: number;
  }>;
  onDestinationSelect: (destination: string, etaSeconds: number) => void;
  navMode?: NavigationMode;
}

const ARNavigation2: React.FC<ARNavigation2Props> = ({ 
  destinations,
  onDestinationSelect,
  navMode = 'walking'
}) => {
  const [destination, setDestination] = useState<{ x: number; y: number; z: number } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    position: { x: number; y: number; z: number };
    etaSeconds: number;
  } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [useMobileCamera, setUseMobileCamera] = useState(false);
  const controlsRef = useRef<any>(null);
  
  // Detect if user is on mobile device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setUseMobileCamera(isMobile);
  }, []);

  const handleNavigation = (point: { x: number; y: number; z: number }) => {
    setDestination(point);
    
    // Find closest destination to clicked point
    type DestinationType = {
      name: string;
      position: { x: number; y: number; z: number };
      etaSeconds: number;
    };
    let closestDest: DestinationType | null = null;
    let minDistance = Infinity;
    
    destinations.forEach((dest) => {
      const distance = Math.sqrt(
        Math.pow(dest.position.x - point.x, 2) + 
        Math.pow(dest.position.z - point.z, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDest = dest;
      }
    });
    
    // If clicked near a destination (within 3 units), select it
    if (minDistance < 3 && closestDest) {
      setSelectedLabel((closestDest as DestinationType).name);
      setSelectedDestination(closestDest as DestinationType);
      onDestinationSelect((closestDest as DestinationType).name, (closestDest as DestinationType).etaSeconds);
    }
  };
  
  // Camera controls
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
    }
  };
  
  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
    }
  };
  
  const handleRotateView = () => {
    if (controlsRef.current) {
      // Rotate the camera 45 degrees
      controlsRef.current.rotateLeft(Math.PI / 4);
    }
  };
  
  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
    // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  return (
    <div style={{ 
      position: 'relative',
      height: '600px', 
      borderRadius: jpmcThemeUI.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: isDarkMode ? '0 8px 24px rgba(0, 114, 198, 0.4)' : jpmcThemeUI.shadows.lg
    }}>
      {/* Mobile camera view */}
      {useMobileCamera && (
        <MobileCameraView 
          active={true} 
          onCameraError={(error) => console.error('Camera error:', error)}
        />
      )}
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: isDarkMode 
          ? `linear-gradient(to right, ${jpmcColors.dark}, ${jpmcColors.secondary})` 
          : `linear-gradient(to right, ${jpmcColors.primary}, ${jpmcColors.secondary})`,
        color: jpmcColors.white,
        padding: '15px 20px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: isDarkMode ? '0 4px 12px rgba(0, 45, 114, 0.5)' : jpmcThemeUI.shadows.md,
        backdropFilter: isDarkMode ? 'blur(8px)' : 'none',
        borderBottom: isDarkMode ? `1px solid ${jpmcColors.primary}40` : 'none'
      }}>
        <div>
          <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: 900 }}>
            JPMC AR Office Navigation
          </h3>
          {selectedLabel && (
            <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
              Navigating to: <strong>{selectedLabel}</strong>
            </p>
          )}
        </div>
        <div style={{
          fontSize: '0.85rem',
          background: jpmcColors.accentOrange,
          padding: '6px 12px',
          borderRadius: jpmcThemeUI.borderRadius.sm,
          color: jpmcColors.white,
          fontWeight: 500,
          letterSpacing: '0.5px'
        }}>
          Click on the floor to navigate
        </div>
      </div>
      
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#f5f5f5' }}
      >
        <Scene 
          destination={destination} 
          onNavigate={handleNavigation} 
          locations={destinations}
          navMode={navMode}
          controlsRef={controlsRef}
          etaSeconds={selectedDestination?.etaSeconds}
          isDarkMode={isDarkMode}
        />
      </Canvas>
      
      <ARControls
        onModeChange={(mode) => {
          // Just for demonstration, actual mode changes would be handled by the parent
          console.log("Navigation mode changed to:", mode);
        }}
        currentMode={navMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotateView={handleRotateView}
        onResetView={handleResetView}
        etaSeconds={selectedDestination?.etaSeconds}
      />
      
      {useMobileCamera && <MobileCameraView active={true} />}
    </div>
  );
};

export default ARNavigation2;
