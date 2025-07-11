import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ARControls from './ARControls';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';
import TWEEN from '@tweenjs/tween.js';

// Helper for orbit controls
const CameraController = () => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  
  return null;
};

// Arrow indicator pointing to destination
const DirectionalArrow = ({ position, rotation }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[0.2, 0.5, 32]} />
      <meshStandardMaterial color={jpmcColors.accentOrange} />
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial color={jpmcColors.accentOrange} />
      </mesh>
    </mesh>
  );
};

// Path visualization
const NavigationPath = ({ points }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (!ref.current) return;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    ref.current.geometry = geometry;
  }, [points]);
  
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={jpmcColors.highlight} linewidth={3} />
    </line>
  );
};

// Floor grid with clickable navigation
const NavigableFloor = ({ onNavigate }) => {
  const floorSize = 20;
  const gridDivisions = 20;
  
  const handleClick = (event) => {
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

// Office furniture and structures
const OfficeEnvironment = () => {
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
        <mesh position={[0, 2.7, 2.1]} receiveShadow>
          <textGeometry args={["Meeting Room", { size: 0.3, height: 0.05 }]} />
          <meshStandardMaterial color={jpmcColors.white} />
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
    </group>
  );
};

// User avatar that moves to clicked positions
const UserAvatar = ({ position, destination }) => {
  const ref = useRef();
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
  }, [destination]);
  
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
    </group>
  );
};

// Destination marker that appears when clicking
const DestinationMarker = ({ position }) => {
  const [opacity, setOpacity] = useState(1);
  const ref = useRef();
  
  // Pulsing animation for the marker
  useFrame(() => {
    if (ref.current) {
      setOpacity(0.5 + Math.sin(Date.now() * 0.005) * 0.5);
      ref.current.material.opacity = opacity;
    }
  });
  
  if (!position) return null;
  
  return (
    <mesh ref={ref} position={[position.x, 0.05, position.z]}>
      <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
      <meshStandardMaterial 
        color={jpmcColors.accentOrange} 
        transparent={true} 
        opacity={opacity}
      />
    </mesh>
  );
};

// Main scene
const Scene = ({ destination, onNavigate }) => {
  const avatarPosition = { x: 0, y: 0, z: 0 };
  const [navPoints, setNavPoints] = useState([]);
  
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
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <CameraController />
      
      <NavigableFloor onNavigate={onNavigate} />
      <OfficeEnvironment />
      
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
          />
        </>
      )}
      
      <UserAvatar position={avatarPosition} destination={destination} />
    </>
  );
};

interface ARNavigationProps {
  destinations: Array<{
    name: string;
    position: { x: number; y: number; z: number };
    etaSeconds: number;
  }>;
  onDestinationSelect: (destination: string, etaSeconds: number) => void;
}

const ARNavigation: React.FC<ARNavigationProps> = ({ 
  destinations,
  onDestinationSelect
}) => {
  const [destination, setDestination] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  const handleNavigation = (point) => {
    setDestination(point);
    
    // Find closest destination to clicked point
    let closestDest = null;
    let minDistance = Infinity;
    
    destinations.forEach(dest => {
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
      setSelectedLabel(closestDest.name);
      onDestinationSelect(closestDest.name, closestDest.etaSeconds);
    }
  };
  
  return (
    <div style={{ 
      position: 'relative',
      height: '500px', 
      borderRadius: jpmcThemeUI.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: jpmcThemeUI.shadows.lg
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: jpmcColors.overlay,
        color: jpmcColors.white,
        padding: '10px 15px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0', fontSize: '1.2rem' }}>JPMC Office Navigation</h3>
          {selectedLabel && (
            <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
              Navigating to: {selectedLabel}
            </p>
          )}
        </div>
        <div style={{
          fontSize: '0.85rem',
          background: jpmcColors.accentOrange,
          padding: '5px 10px',
          borderRadius: jpmcThemeUI.borderRadius.sm,
          color: jpmcColors.dark
        }}>
          Click on the floor to navigate
        </div>
      </div>
      
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#f5f5f5' }}
      >
        <Scene destination={destination} onNavigate={handleNavigation} />
      </Canvas>
    </div>
  );
};

export default ARNavigation;
