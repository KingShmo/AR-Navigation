import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { jpmcColors } from './jpmcTheme';

interface ARDirectionIndicatorProps {
  direction: 'forward' | 'left' | 'right' | 'stairs' | 'elevator';
  distance: number;
  destination: string;
  isDarkMode?: boolean;
}

const ARDirectionIndicator: React.FC<ARDirectionIndicatorProps> = ({
  direction,
  distance,
  destination,
  isDarkMode = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(1);

  // Get color based on direction
  const getDirectionColor = () => {
    switch (direction) {
      case 'left': return jpmcColors.accentBlue;
      case 'right': return jpmcColors.accentOrange;
      case 'stairs': return jpmcColors.accentGreen;
      case 'elevator': return jpmcColors.accentYellow;
      default: return jpmcColors.primary;
    }
  };

  const color = getDirectionColor();

  // Pulsating animation
  useEffect(() => {
    const pulsate = () => {
      setScale((prevScale) => {
        // Oscillate between 0.95 and 1.05
        if (prevScale >= 1.05) return 0.95;
        return prevScale + 0.005;
      });
    };

    const interval = setInterval(pulsate, 30);
    return () => clearInterval(interval);
  }, []);

  // Make the indicator always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
      // Make the scale pulsate
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  // Different arrow shapes based on direction
  const renderArrowShape = () => {
    switch (direction) {
      case 'forward':
        return (
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[0.5, 1, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
        
      case 'left':
        return (
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.5, 1, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
        
      case 'right':
        return (
          <group rotation={[0, 0, -Math.PI / 2]}>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.5, 1, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
        
      case 'stairs':
        return (
          <group>
            {/* Steps representation */}
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[0, -0.3 + i * 0.3, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.2]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            ))}
            
            {/* Up arrow */}
            <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.4, 0.7, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
        
      case 'elevator':
        return (
          <group>
            {/* Elevator box */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.2]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Up/down arrows */}
            <mesh position={[0, 0.4, 0.15]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.2, 0.4, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh position={[0, -0.4, 0.15]}>
              <coneGeometry args={[0.2, 0.4, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
        
      default:
        return (
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[0.5, 1, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {renderArrowShape()}
      
      {/* Distance indicator */}
      <Text
        position={[0, -1.2, 0]}
        color={isDarkMode ? '#ffffff' : '#ffffff'}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={isDarkMode ? jpmcColors.secondary : jpmcColors.primary}
      >
        {`${Math.round(distance)}m`}
      </Text>
      
      {/* Destination name */}
      <Text
        position={[0, -1.7, 0]}
        color={color}
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={isDarkMode ? '#000000' : '#ffffff'}
        maxWidth={5}
      >
        {destination}
      </Text>
      
      {/* Add glowing effect */}
      <pointLight 
        position={[0, 0, 1]} 
        color={color} 
        intensity={1} 
        distance={3}
      />
    </group>
  );
};

export default ARDirectionIndicator;
