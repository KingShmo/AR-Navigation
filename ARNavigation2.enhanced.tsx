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
import GoogleStyleARView from './GoogleStyleARView';
import ARInfoPanel from './ARInfoPanel';
import { officeImages } from './assets/office-images';

// Debug info component to help troubleshooting
const DebugInfo: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      left: 10,
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div>Debug Mode</div>
      <div>Version: ENHANCED-FIX-2.0</div>
      <div>Camera Access: DISABLED BY DEFAULT</div>
      <div>AR Mode: REQUIRES EXPLICIT USER ACTION</div>
    </div>
  );
      <div>AR Mode: REQUIRES EXPLICIT USER ACTION</div>
    </div>
  );
};

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

// Path visualization with glowing effect
const NavigationPath = ({ points, isDarkMode = true }: { 
  points: Array<{ x: number; y: number; z: number }>,
  isDarkMode?: boolean 
}) => {
  const ref = useRef<THREE.Line>(null);

  useEffect(() => {
    if (!ref.current || !points || points.length < 2) return;

    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    ref.current.geometry = geometry;
  }, [points]);

  return (
    <primitive
      object={new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, p.z))),
        new THREE.LineBasicMaterial({ 
          color: isDarkMode ? jpmcColors.primary : jpmcColors.highlight,
          linewidth: 3,
          opacity: isDarkMode ? 0.8 : 1,
          transparent: isDarkMode
        })
      )}
    />
  );
};

// Floor grid with clickable navigation
interface NavigableFloorProps {
  onNavigate: (point: { x: number; y: number; z: number }) => void;
  isDarkMode?: boolean;
}

interface FloorClickEvent {
  stopPropagation: () => void;
  point: { x: number; y: number; z: number };
}

const NavigableFloor = ({ onNavigate, isDarkMode = true }: NavigableFloorProps) => {
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
          color={isDarkMode ? "#0A0A0A" : jpmcColors.gray} 
          opacity={0.8}
          transparent={true}
          roughness={0.8}
          emissive={isDarkMode ? "#101010" : undefined}
          emissiveIntensity={isDarkMode ? 0.1 : 0}
        />
      </mesh>
      <gridHelper 
        args={[floorSize, gridDivisions, 
          isDarkMode ? jpmcColors.primary : jpmcColors.grayDark, 
          isDarkMode ? "#101010" : jpmcColors.gray
        ]} 
        position={[0, 0.01, 0]}
      />
    </group>
  );
};

// Location Label that appears above a location
interface LocationLabelProps {
  position: { x: number; y: number; z: number };
  text: string;
  isDarkMode?: boolean;
}

const LocationLabel: React.FC<LocationLabelProps> = ({ position, text, isDarkMode = true }) => {
  return (
    <group position={[position.x, position.y + 3.2, position.z]}>
      <Text
        color={jpmcColors.white}
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={isDarkMode ? jpmcColors.primary : jpmcColors.secondary}
        fillOpacity={isDarkMode ? 0.9 : 1}
      >
        {text}
      </Text>
      
      {/* Add glowing effect in dark mode */}
      {isDarkMode && (
        <pointLight
          position={[0, 0, 0]}
          intensity={0.6}
          distance={5}
          color={jpmcColors.primary}
        />
      )}
    </group>
  );
};

// Office furniture and structures
const OfficeEnvironment = ({ 
  locations,
  isDarkMode = true
}: { 
  locations: Array<{ name: string; position: { x: number; y: number; z: number } }>,
  isDarkMode?: boolean
}) => {
  // Get wall color based on dark mode
  const wallColor = isDarkMode ? "#121212" : "#f0f0f0";
  const floorColor = isDarkMode ? "#0A0A0A" : "#d0d0d0";
  
  return (
    <group>
      {/* Main office walls */}
      <mesh position={[0, 2, -10]} receiveShadow castShadow>
        <boxGeometry args={[20, 4, 0.2]} />
        <meshStandardMaterial 
          color={wallColor} 
          emissive={isDarkMode ? wallColor : undefined}
          emissiveIntensity={isDarkMode ? 0.1 : 0}
        />
      </mesh>
      <mesh position={[-10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial 
          color={wallColor}
          emissive={isDarkMode ? wallColor : undefined}
          emissiveIntensity={isDarkMode ? 0.1 : 0}
        />
      </mesh>
      <mesh position={[10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial 
          color={wallColor}
          emissive={isDarkMode ? wallColor : undefined}
          emissiveIntensity={isDarkMode ? 0.1 : 0}
        />
      </mesh>
      
      {/* Floor with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={floorColor}
          roughness={0.7}
          emissive={isDarkMode ? floorColor : undefined}
          emissiveIntensity={isDarkMode ? 0.05 : 0}
        />
      </mesh>
      
      {/* Meeting room */}
      <group position={[-5, 0, -7]}>
        <mesh position={[0, 1.5, 2]} receiveShadow castShadow>
          <boxGeometry args={[6, 3, 0.2]} />
          <meshStandardMaterial 
            color={wallColor}
            emissive={isDarkMode ? wallColor : undefined}
            emissiveIntensity={isDarkMode ? 0.1 : 0}
          />
        </mesh>
        <mesh position={[-3, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 3, 4]} />
          <meshStandardMaterial 
            color={wallColor}
            emissive={isDarkMode ? wallColor : undefined}
            emissiveIntensity={isDarkMode ? 0.1 : 0}
          />
        </mesh>
        <mesh position={[0, 1.5, -2]} receiveShadow castShadow>
          <boxGeometry args={[6, 3, 0.2]} />
          <meshStandardMaterial 
            color={wallColor}
            emissive={isDarkMode ? wallColor : undefined}
            emissiveIntensity={isDarkMode ? 0.1 : 0}
          />
        </mesh>
        
        {/* Conference table */}
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Sign with glow in dark mode */}
        <mesh position={[0, 2.7, 2.05]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={jpmcColors.primary} 
            emissive={isDarkMode ? jpmcColors.primary : undefined}
            emissiveIntensity={isDarkMode ? 0.5 : 0}
          />
        </mesh>
        
        {isDarkMode && (
          <pointLight
            position={[0, 2.7, 1.8]}
            intensity={0.5}
            distance={3}
            color={jpmcColors.primary}
          />
        )}
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
          
          {/* Monitor with glowing screen in dark mode */}
          <mesh position={[0, 0.7, -0.2]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.3, 0.05]} />
            <meshStandardMaterial 
              color="#333" 
              emissive={isDarkMode ? jpmcColors.accentBlue : undefined}
              emissiveIntensity={isDarkMode ? 0.3 : 0}
            />
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
          <meshStandardMaterial 
            color={wallColor} 
            opacity={0.5} 
            transparent={true}
            emissive={isDarkMode ? wallColor : undefined}
            emissiveIntensity={isDarkMode ? 0.1 : 0}
          />
        </mesh>
        
        {/* Cafeteria sign with glow */}
        <mesh position={[0, 2.7, 2]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={jpmcColors.accentGreen}
            emissive={isDarkMode ? jpmcColors.accentGreen : undefined}
            emissiveIntensity={isDarkMode ? 0.5 : 0}
          />
        </mesh>
        
        {isDarkMode && (
          <pointLight
            position={[0, 2.7, 1.8]}
            intensity={0.5}
            distance={3}
            color={jpmcColors.accentGreen}
          />
        )}
      </group>
      
      {/* Executive office */}
      <group position={[7, 0, 7]}>
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial 
            color={wallColor} 
            opacity={0.5} 
            transparent={true}
            emissive={isDarkMode ? wallColor : undefined}
            emissiveIntensity={isDarkMode ? 0.1 : 0}
          />
        </mesh>
        
        {/* Executive sign with glow */}
        <mesh position={[0, 2.7, 2]} receiveShadow>
          <boxGeometry args={[2.5, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={isDarkMode ? 0.5 : 0}
          />
        </mesh>
        
        {isDarkMode && (
          <pointLight
            position={[0, 2.7, 1.8]}
            intensity={0.5}
            distance={3}
            color={jpmcColors.secondary}
          />
        )}
      </group>
      
      {/* Starbucks */}
      <group position={[-7, 0, 7]}>
        <mesh position={[0, 1, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial 
            color="#00704A" 
            opacity={0.7} 
            transparent={true}
            emissive={isDarkMode ? "#00704A" : undefined}
            emissiveIntensity={isDarkMode ? 0.2 : 0}
          />
        </mesh>
        
        {/* Starbucks sign */}
        <mesh position={[0, 2.2, 1.55]} receiveShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial 
            color="#00704A"
            emissive={isDarkMode ? "#00704A" : undefined}
            emissiveIntensity={isDarkMode ? 0.5 : 0}
          />
        </mesh>
        
        {isDarkMode && (
          <pointLight
            position={[0, 2.2, 1.3]}
            intensity={0.5}
            distance={3}
            color="#00704A"
          />
        )}
      </group>
      
      {/* Location labels */}
      {locations?.map((location) => (
        <LocationLabel 
          key={location.name}
          position={location.position}
          text={location.name}
          isDarkMode={isDarkMode}
        />
      ))}
    </group>
  );
};

// User avatar that moves to clicked positions
interface UserAvatarProps {
  position: { x: number; y: number; z: number };
  destination?: { x: number; y: number; z: number } | null;
  isDarkMode?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ position, destination, isDarkMode = true }) => {
  const ref = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState({ x: position.x, y: position.y, z: position.z });
  
  // Handle animation with TWEEN
  useEffect(() => {
    if (destination && ref.current) {
      new TWEEN.Tween(currentPos)
        .to({ x: destination.x, y: destination.y, z: destination.z }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          setCurrentPos({ ...currentPos });
          if (ref.current) {
            ref.current.position.x = currentPos.x;
            ref.current.position.z = currentPos.z;
          }
        })
        .start();
    }
  }, [destination, currentPos]);
  
  // Update TWEEN on each frame
  useFrame(() => {
    TWEEN.update();
  });
  
  return (
    <group ref={ref} position={[position.x, position.y, position.z]}>
      {/* Head with glow in dark mode */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.primary}
          emissive={isDarkMode ? jpmcColors.primary : undefined}
          emissiveIntensity={isDarkMode ? 0.5 : 0}
        />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.8, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.primary}
          emissive={isDarkMode ? jpmcColors.primary : undefined}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.25, 1.2, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.primary}
          emissive={isDarkMode ? jpmcColors.primary : undefined}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[-0.25, 1.2, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.primary}
          emissive={isDarkMode ? jpmcColors.primary : undefined}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.secondary}
          emissive={isDarkMode ? jpmcColors.secondary : undefined}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[-0.1, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.secondary}
          emissive={isDarkMode ? jpmcColors.secondary : undefined}
          emissiveIntensity={isDarkMode ? 0.3 : 0}
        />
      </mesh>
      
      {/* Direction indicator above head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={jpmcColors.accentOrange} 
          emissive={jpmcColors.accentOrange} 
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* User label with enhanced styling */}
      <Html position={[0, 2.2, 0]} center>
        <div style={{
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : jpmcColors.primary,
          color: jpmcColors.white,
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          pointerEvents: 'none',
          boxShadow: isDarkMode ? `0 0 8px ${jpmcColors.primary}` : 'none',
          borderLeft: isDarkMode ? `2px solid ${jpmcColors.primary}` : 'none',
          backdropFilter: isDarkMode ? 'blur(5px)' : 'none'
        }}>
          YOU ARE HERE
        </div>
      </Html>
      
      {/* Add light in dark mode for better visibility */}
      {isDarkMode && (
        <pointLight
          position={[0, 1.6, 0]}
          intensity={0.4}
          distance={2}
          color={jpmcColors.primary}
        />
      )}
    </group>
  );
};

// Destination marker that appears when clicking
type MarkerPosition = { x: number; y: number; z: number } | null;

const DestinationMarker: React.FC<{ position: MarkerPosition, isDarkMode?: boolean }> = ({ 
  position, 
  isDarkMode = true 
}) => {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Pulsing animation for the marker
  useFrame(() => {
    if (ref.current) {
      const newOpacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
      setOpacity(newOpacity);
      // Type assertion to ensure material is MeshStandardMaterial
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = newOpacity;
      
      // Add scaling animation
      const newScale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
      setScale(newScale);
      ref.current.scale.set(newScale, 1, newScale);
      
      // Glow effect
      if (glowRef.current) {
        glowRef.current.scale.set(newScale + 0.5, 1, newScale + 0.5);
        const glowMat = glowRef.current.material as THREE.MeshStandardMaterial;
        if (glowMat) glowMat.opacity = newOpacity * 0.5;
      }
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
      
      {/* Add light for better visibility in dark mode */}
      {isDarkMode && (
        <pointLight
          position={[0, 0.3, 0]}
          intensity={0.7}
          distance={2.5}
          color={jpmcColors.primary}
        />
      )}
    </group>
  );
};

// Main scene
interface SceneProps {
  destination: { x: number; y: number; z: number } | null;
  onNavigate: (point: { x: number; y: number; z: number }) => void;
  locations: Array<{ name: string; position: { x: number; y: number; z: number } }>;
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
      // In a real implementation, this would calculate proper paths
      // around obstacles
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
      
      <NavigableFloor onNavigate={onNavigate} isDarkMode={isDarkMode} />
      <OfficeEnvironment locations={locations} isDarkMode={isDarkMode} />
      
      {destination && (
        <>
          <NavigationPath points={navPoints} isDarkMode={isDarkMode} />
          <DestinationMarker position={destination} isDarkMode={isDarkMode} />
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
      
      <UserAvatar position={avatarPosition} destination={destination} isDarkMode={isDarkMode} />
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
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [useMobileCamera, setUseMobileCamera] = useState(false); // Initially false for everyone
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(true); // Show debug info by default
  const controlsRef = useRef<any>(null);
    // Detect if user is on mobile device but don't enable camera automatically
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    // Important: NEVER set useMobileCamera here - this was causing immediate camera access
    console.log("Device detection:", isMobile ? "Mobile device" : "Desktop device");
    
    // CRITICAL: Ensure camera is never accessed on load
    setUseMobileCamera(false);
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
    }}>      {/* Mobile camera view - ONLY active when explicitly enabled via UI */}
      {useMobileCamera && (
        <GoogleStyleARView 
          active={useMobileCamera} // Only active when explicitly enabled
          onCameraError={(error) => {
            console.error('Camera error:', error);
            // Fall back to 3D mode on error
            setUseMobileCamera(false);
            // Show an error message to the user
            alert("Camera access error: " + error + "\nSwitching back to 3D view.");
          }}
          direction={'forward'} 
          destination={selectedDestination?.name || "Select destination"}
          eta={selectedDestination?.etaSeconds || 0}
          distance={Math.floor((selectedDestination?.etaSeconds || 0) / 3)}
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
      }}>        <div>
          <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: 900 }}>
            JPMC AR Office Navigation
          </h3>
          {selectedLabel && (
            <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
              Navigating to: <strong>{selectedLabel}</strong>
            </p>
          )}
        </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowInfoPanel(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${jpmcColors.white}`,
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: jpmcColors.white,
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
            aria-label="Show navigation help"
          >
            ℹ️
          </button>
            {/* AR mode toggle - make it more prominent */}
          {isMobileDevice && (
            <button 
              onClick={() => setUseMobileCamera(prev => !prev)}
              style={{
                background: useMobileCamera ? jpmcColors.accentOrange : jpmcColors.primary,
                border: `2px solid ${jpmcColors.white}`,
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: jpmcColors.white,
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              }}
              aria-label={useMobileCamera ? "Switch to 3D view" : "Switch to AR view"}
            >
              {useMobileCamera ? '🏢' : '📷'}
            </button>
          )}
          
          <button 
            onClick={toggleDarkMode}
            style={{
              background: 'transparent',
              border: `1px solid ${jpmcColors.white}`,
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: jpmcColors.white,
              cursor: 'pointer',
              fontSize: '12px',
              padding: 0
            }}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <div style={{
            fontSize: '0.85rem',
            background: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : jpmcColors.accentOrange,
            padding: '6px 12px',
            borderRadius: jpmcThemeUI.borderRadius.sm,
            color: jpmcColors.white,
            fontWeight: 500,
            letterSpacing: '0.5px',
            boxShadow: isDarkMode ? `0 0 8px ${jpmcColors.primary}60` : 'none',
            backdropFilter: isDarkMode ? 'blur(5px)' : 'none',
            border: isDarkMode ? `1px solid ${jpmcColors.primary}40` : 'none'
          }}>
            {useMobileCamera ? 'AR Mode Active' : 'Click on the floor to navigate'}
          </div>
        </div>
      </div>
      
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: isDarkMode ? '#0A0A0A' : '#f5f5f5' }}
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
        {/* Dark mode toggle button (separate from header for accessibility) */}
      <button
        onClick={toggleDarkMode}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          background: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : jpmcColors.white,
          border: `1px solid ${isDarkMode ? jpmcColors.primary : jpmcColors.gray}`,
          borderRadius: jpmcThemeUI.borderRadius.round,
          width: '40px',
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: isDarkMode ? jpmcColors.white : jpmcColors.dark,
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0,
          boxShadow: jpmcThemeUI.shadows.md,
          zIndex: 100
        }}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      
      {/* Toggle AR mode button */}
      {isMobileDevice && (
        <button
          onClick={() => setUseMobileCamera(prev => !prev)}
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            background: useMobileCamera ? jpmcColors.accentOrange : 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${useMobileCamera ? jpmcColors.accentOrange : jpmcColors.primary}`,
            borderRadius: jpmcThemeUI.borderRadius.round,
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: jpmcColors.white,
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            boxShadow: jpmcThemeUI.shadows.md,
            zIndex: 100
          }}
          aria-label={useMobileCamera ? "Switch to 3D view" : "Switch to AR view"}
        >
          {useMobileCamera ? '🏢' : '📷'}
        </button>
      )}
      
      {/* Information panel */}
      {showInfoPanel && (
        <ARInfoPanel 
          isDarkMode={isDarkMode} 
          onClose={() => setShowInfoPanel(false)} 
        />
      )}
        {/* Floating AR toggle button for easy access */}
      {isMobileDevice && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}>
          <button
            onClick={() => setUseMobileCamera(prev => !prev)}
            style={{
              background: useMobileCamera ? jpmcColors.accentOrange : jpmcColors.primary,
              border: `none`,
              borderRadius: '12px',
              padding: '10px 15px',
              color: jpmcColors.white,
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {useMobileCamera ? '🏢 3D View' : '📷 AR View'}
          </button>
        </div>
      )}
      
      {/* Debug info */}
      <DebugInfo show={showDebugInfo} />
    </div>
  );
};

export default ARNavigation2;
