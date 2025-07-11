import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleStyle3DView } from './GoogleStyle3DView';
import Enhanced3DPerson from './Enhanced3DPerson';
import { jpmcColors } from './jpmcTheme';
import type { NavigationMode } from './types';

interface EnhancedARNavigation3DProps {
  destinations: Array<{
    name: string;
    position: { x: number; y: number; z: number };
    etaSeconds: number;
  }>;
  navMode: NavigationMode;
  onDestinationSelect: (location: string, seconds: number) => void;
  isDarkMode?: boolean;
}

const EnhancedARNavigation3D: React.FC<EnhancedARNavigation3DProps> = ({
  destinations,
  navMode,
  onDestinationSelect,
  isDarkMode = false
}) => {
  const controlsRef = useRef<any>(null);
  const personGroupRef = useRef<THREE.Group>(null);
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    position: { x: number; y: number; z: number };
    etaSeconds: number;
  } | null>(null);
  const [distance, setDistance] = useState(60);
  
  // Initialize with first destination
  useEffect(() => {
    if (destinations.length > 0 && !selectedDestination) {
      setSelectedDestination(destinations[0]);
      calculateDistance(destinations[0].position);
    }
  }, [destinations, selectedDestination]);

  // Calculate distance based on position
  const calculateDistance = (position: { x: number; y: number; z: number }) => {
    // Simple Euclidean distance calculation
    const dist = Math.sqrt(
      Math.pow(position.x, 2) + Math.pow(position.y, 2) + Math.pow(position.z, 2)
    );
    setDistance(Math.round(dist * 10)); // 10 feet per unit, approximate
  };
  
  // Handle navigation to new destination point
  const handleNavigate = (point: { x: number; y: number; z: number }) => {
    // Find closest destination to clicked point
    const closestDest = destinations.reduce((closest, dest) => {
      const currentDist = Math.sqrt(
        Math.pow(dest.position.x - point.x, 2) + 
        Math.pow(dest.position.y - point.y, 2) + 
        Math.pow(dest.position.z - point.z, 2)
      );
      
      if (!closest || currentDist < closest.distance) {
        return { destination: dest, distance: currentDist };
      }
      return closest;
    }, null as { destination: typeof destinations[0]; distance: number } | null);
    
    if (closestDest) {
      setSelectedDestination(closestDest.destination);
      calculateDistance(closestDest.destination.position);
      onDestinationSelect(closestDest.destination.name, closestDest.destination.etaSeconds);
    }
  };
  
  // Get direction type based on path segments
  const getDirectionType = (): 'forward' | 'left' | 'right' | 'stairs' | 'elevator' => {
    // This would be dynamic in a real implementation
    // For now return different directions based on destination
    if (!selectedDestination) return 'forward';
    
    const destName = selectedDestination.name;
    if (destName.includes('Meeting')) return 'left';
    if (destName.includes('Executive')) return 'right';
    if (destName.includes('Cafeteria')) return 'forward';
    if (destName.includes('Elevator')) return 'elevator';
    if (destName.includes('Stair')) return 'stairs';
    return 'forward';
  };
    // Get current avatar position - in a real app this would be tracked
  const getAvatarPosition = () => {
    if (personGroupRef.current) {
      return {
        x: personGroupRef.current.position.x,
        y: personGroupRef.current.position.y,
        z: personGroupRef.current.position.z
      };
    }
    return { x: 0, y: 0, z: 0 };
  };

  // Calculate ETA based on distance and navigation mode
  const calculateETA = () => {
    if (!selectedDestination) return 180;
    
    let eta = selectedDestination.etaSeconds;
    
    // Adjust ETA based on navigation mode
    switch (navMode) {
      case 'wheelchair': eta = Math.round(eta * 1.2); break;
      case 'stairs': eta = Math.round(eta * 0.9); break;
      case 'elevator': eta = Math.round(eta * 1.5); break;
    }
    
    return eta;
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: isDarkMode ? '#121212' : '#f5f5f5' }}
        onClick={(event) => {
          // Handle click navigation on floor
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();
          
          // Calculate mouse position in normalized device coordinates
          mouse.x = (event.nativeEvent.offsetX / event.currentTarget.clientWidth) * 2 - 1;
          mouse.y = -(event.nativeEvent.offsetY / event.currentTarget.clientHeight) * 2 + 1;
          
          // Access camera and scene from the React Three Fiber event
          const { camera, scene } = event.target.getState();
          
          // Update the raycaster with the camera and mouse position
          raycaster.setFromCamera(mouse, camera);
          
          // Calculate intersections with objects in the scene
          const intersections = raycaster.intersectObjects(scene.children, true);
          
          if (intersections.length > 0) {
            const hit = intersections[0];
            // Only navigate when clicking on the floor
            if (hit.object.name === 'floor' || !hit.object.name) {
              handleNavigate(hit.point);
            }
          }
        }}
      >
        {/* Add appropriate lighting */}
        <ambientLight intensity={isDarkMode ? 0.3 : 0.6} 
          color={isDarkMode ? '#1a2338' : '#ffffff'}
        />
        
        <directionalLight 
          position={[5, 10, 7.5]}
          intensity={isDarkMode ? 0.5 : 0.8}
          castShadow
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          color={isDarkMode ? '#6a8ad2' : '#ffffff'}
        />
        
        {/* Add accent lighting for visual interest */}
        <pointLight
          position={[-8, 5, -8]}
          intensity={isDarkMode ? 0.8 : 0.3}
          distance={20}
          color={isDarkMode ? jpmcColors.accentBlue : jpmcColors.accentYellow}
        />
        
        <pointLight
          position={[8, 4, 8]}
          intensity={isDarkMode ? 0.6 : 0.2}
          distance={15}
          color={isDarkMode ? jpmcColors.accentOrange : jpmcColors.accentGreen}
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
          {/* Office Floor */}
        <mesh 
          name="floor"
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.01, 0]} 
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color={isDarkMode ? '#1c2c4a' : jpmcColors.gray}
            roughness={isDarkMode ? 0.65 : 0.8}
            metalness={isDarkMode ? 0.3 : 0.1}
            emissive={isDarkMode ? '#0a1525' : '#000000'}
            emissiveIntensity={isDarkMode ? 0.2 : 0}
          />
        </mesh>
        
        {/* Office Environment - Walls */}
        {/* Back Wall */}
        <mesh position={[0, 2, -10]} receiveShadow castShadow>
          <boxGeometry args={[20, 4, 0.2]} />
          <meshStandardMaterial 
            color={isDarkMode ? '#1e3756' : '#f0f0f0'}
            roughness={isDarkMode ? 0.8 : 0.9}
            metalness={isDarkMode ? 0.2 : 0.1}
            emissive={isDarkMode ? '#1e3756' : undefined}
            emissiveIntensity={isDarkMode ? 0.05 : 0}
          />
        </mesh>
        
        {/* Left Wall */}
        <mesh position={[-10, 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 4, 20]} />
          <meshStandardMaterial 
            color={isDarkMode ? '#1e3756' : '#f0f0f0'}
            roughness={isDarkMode ? 0.8 : 0.9}
            metalness={isDarkMode ? 0.2 : 0.1}
            emissive={isDarkMode ? '#1e3756' : undefined}
            emissiveIntensity={isDarkMode ? 0.05 : 0}
          />
        </mesh>
        
        {/* Right Wall */}
        <mesh position={[10, 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 4, 20]} />
          <meshStandardMaterial 
            color={isDarkMode ? '#1e3756' : '#f0f0f0'}
            roughness={isDarkMode ? 0.8 : 0.9}
            metalness={isDarkMode ? 0.2 : 0.1}
            emissive={isDarkMode ? '#1e3756' : undefined}
            emissiveIntensity={isDarkMode ? 0.05 : 0}
          />
        </mesh>
        
        {/* Meeting Room */}
        <group position={[-4, 0, -7]}>
          {/* Room Walls */}
          <mesh position={[0, 1.5, 2]} receiveShadow castShadow>
            <boxGeometry args={[6, 3, 0.2]} />
            <meshStandardMaterial 
              color={isDarkMode ? '#1e3756' : '#f0f0f0'}
              roughness={isDarkMode ? 0.8 : 0.9}
              emissive={isDarkMode ? '#1e3756' : undefined}
              emissiveIntensity={isDarkMode ? 0.05 : 0}
            />
          </mesh>
          <mesh position={[-3, 1.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 3, 4]} />
            <meshStandardMaterial 
              color={isDarkMode ? '#1e3756' : '#f0f0f0'}
              roughness={isDarkMode ? 0.8 : 0.9}
              emissive={isDarkMode ? '#1e3756' : undefined}
              emissiveIntensity={isDarkMode ? 0.05 : 0}
            />
          </mesh>
          <mesh position={[0, 1.5, -2]} receiveShadow castShadow>
            <boxGeometry args={[6, 3, 0.2]} />
            <meshStandardMaterial 
              color={isDarkMode ? '#1e3756' : '#f0f0f0'}
              roughness={isDarkMode ? 0.8 : 0.9}
              emissive={isDarkMode ? '#1e3756' : undefined}
              emissiveIntensity={isDarkMode ? 0.05 : 0}
            />
          </mesh>
          
          {/* Conference table */}
          <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[3, 0.1, 2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.5}
              metalness={0.2}
              emissive={isDarkMode ? '#3a1c06' : undefined}
              emissiveIntensity={isDarkMode ? 0.2 : 0}
            />
          </mesh>
          
          {/* Accent strip on meeting room wall with JPMC branding */}
          <mesh position={[0, 2.7, 2.05]} receiveShadow>
            <boxGeometry args={[2, 0.6, 0.1]} />
            <meshStandardMaterial 
              color={jpmcColors.primary}
              roughness={0.3}
              metalness={0.6}
              emissive={jpmcColors.primary}
              emissiveIntensity={isDarkMode ? 0.5 : 0.2}
            />
          </mesh>
          
          {/* Meeting room light */}
          {isDarkMode && (
            <pointLight 
              position={[0, 2, 0]} 
              intensity={0.7}
              distance={8}
              color="#4a89ca"
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
              <meshStandardMaterial 
                color="#D2B48C" 
                roughness={0.6}
                metalness={0.1}
                emissive={isDarkMode ? '#3a3228' : undefined}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
            
            {/* Monitor with glowing screen in dark mode */}
            <mesh position={[0, 0.7, -0.2]} receiveShadow castShadow>
              <boxGeometry args={[0.5, 0.3, 0.05]} />
              <meshStandardMaterial 
                color="#333" 
                emissive={isDarkMode ? jpmcColors.accentBlue : undefined}
                emissiveIntensity={isDarkMode ? 0.7 : 0}
              />
            </mesh>
            
            {/* Monitor screen */}
            <mesh position={[0, 0.7, -0.17]} receiveShadow>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial 
                color={isDarkMode ? '#1e3756' : '#ffffff'}
                emissive={isDarkMode ? '#3a6ea5' : undefined}
                emissiveIntensity={isDarkMode ? 0.5 : 0}
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
            
            {/* Random desk items */}
            {Math.random() > 0.5 && (
              <mesh position={[0.3, 0.45, 0.1]} receiveShadow castShadow>
                <cylinderGeometry args={[0.05, 0.04, 0.1, 16]} />
                <meshStandardMaterial 
                  color={jpmcColors.accentOrange} 
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
            )}
          </group>
        ))}
          {/* Enhanced 3D Person */}
        <group ref={personGroupRef} position={[0, 0, 0]}>
          <Enhanced3DPerson isDarkMode={isDarkMode} personType="diverse" />
        </group>
        
        {/* Add some plants for a more vibrant office */}
        {[[-7, -3], [8, 4], [-2, 6]].map((pos, i) => (
          <group key={i} position={[pos[0], 0, pos[1]]}>
            {/* Pot */}
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.15, 0.3, 16]} />
              <meshStandardMaterial color="#7D5A4F" roughness={0.8} />
            </mesh>
            
            {/* Plant */}            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial 
                color={isDarkMode ? '#1a4d1a' : '#228B22'} 
                roughness={0.8}
                emissive={isDarkMode ? '#0a2d0a' : undefined}
                emissiveIntensity={isDarkMode ? 0.2 : 0}
              />
            </mesh>
          </group>
        ))}
        
        {/* Add a path visualization */}
        {(() => {
          // Example path points based on destination
          const pathPoints = [];
          const startPoint = [0, 0.05, 0];
          let endPoint;
          
          switch(destination) {
            case 'Meeting Room':
            case 'Meeting Room A':
              endPoint = [-4, 0.05, -7];
              pathPoints.push(
                new THREE.Vector3(...startPoint),
                new THREE.Vector3(3, 0.05, 0),
                new THREE.Vector3(3, 0.05, -4),
                new THREE.Vector3(-2, 0.05, -4),
                new THREE.Vector3(...endPoint)
              );
              break;
            case 'Executive Office':
              endPoint = [7, 0.05, 7];
              pathPoints.push(
                new THREE.Vector3(...startPoint),
                new THREE.Vector3(3, 0.05, 0),
                new THREE.Vector3(3, 0.05, 3),
                new THREE.Vector3(7, 0.05, 3),
                new THREE.Vector3(...endPoint)
              );
              break;
            case 'Cafeteria':
              endPoint = [7, 0.05, -8];
              pathPoints.push(
                new THREE.Vector3(...startPoint),
                new THREE.Vector3(3, 0.05, 0),
                new THREE.Vector3(3, 0.05, -4),
                new THREE.Vector3(7, 0.05, -4),
                new THREE.Vector3(...endPoint)
              );
              break;
            default:
              endPoint = [-4, 0.05, -7];
              pathPoints.push(
                new THREE.Vector3(...startPoint),
                new THREE.Vector3(3, 0.05, 0),
                new THREE.Vector3(3, 0.05, -4),
                new THREE.Vector3(-2, 0.05, -4),
                new THREE.Vector3(...endPoint)
              );
          }
          
          return (
            <>
              <line>
                <bufferGeometry attach="geometry" setFromPoints={pathPoints} />
                <lineDashedMaterial 
                  attach="material" 
                  color={isDarkMode ? jpmcColors.accentBlue : jpmcColors.accent}
                  linewidth={3}
                  scale={1}
                  dashSize={0.3}
                  gapSize={0.1}
                />
              </line>
              
              {/* Destination marker with pulsing effect */}
              <mesh position={[endPoint[0], endPoint[1], endPoint[2]]} receiveShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
                <meshStandardMaterial 
                  color={jpmcColors.accentOrange}
                  transparent={true}
                  opacity={0.7}
                  emissive={jpmcColors.accentOrange}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </>
          );
        })()}
      </Canvas>
        {/* Google Maps Style UI overlay */}
      {selectedDestination && (
        <GoogleStyle3DView
          destination={selectedDestination.name}
          eta={calculateETA()}
          distance={distance}
          direction={getDirectionType()}
          navMode={navMode}
          isDarkMode={isDarkMode}
          onNavigate={handleNavigate}
          controlsRef={controlsRef}
        />
      )}
    </div>
  );
};

export default EnhancedARNavigation3D;
