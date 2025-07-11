import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { jpmcColors } from './jpmcTheme';

interface Enhanced3DPersonProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  isDarkMode?: boolean;
  personType?: 'male' | 'female' | 'diverse';
}

/**
 * Enhanced 3D Person component with realistic features
 * - Detailed body parts with proper articulation
 * - Walking animation
 * - JPMC branding elements
 * - Realistic skin tones and clothing
 * - Optional phone/device in hand
 */
const Enhanced3DPerson: React.FC<Enhanced3DPersonProps> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isDarkMode = false,
  personType = 'diverse'
}) => {
  const [legSwing, setLegSwing] = useState(0);
  const [armSwing, setArmSwing] = useState(0);
  const [headTurn, setHeadTurn] = useState(0);
  
  // Generate diverse appearance based on personType
  const skinColor = personType === 'diverse' ? 
    ['#E8AC90', '#D2946B', '#AE8C79', '#795548', '#4E342E'][Math.floor(Math.random() * 5)] : 
    personType === 'female' ? '#E8AC90' : '#D2946B';
    
  const hairColor = personType === 'diverse' ? 
    ['#332211', '#0A0A0A', '#513B1C', '#3B2F2F', '#4C3A32'][Math.floor(Math.random() * 5)] : 
    '#332211';
    
  // Animate walking with smooth, natural movement
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() * 0.003;
      setLegSwing(Math.sin(time));
      setArmSwing(-Math.sin(time));
      setHeadTurn(Math.sin(time * 0.5) * 0.2); // Subtle head movement
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate light and shadow effects based on dark mode
  const emissiveIntensity = isDarkMode ? 0.3 : 0;
  
  return (
    <group position={new THREE.Vector3(...position)} scale={new THREE.Vector3(...scale)} rotation={new THREE.Euler(...rotation)}>
      {/* Head with more details */}
      <group position={[0, 1.6, 0]} rotation={[0, headTurn, 0]}>
        {/* Base head */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial 
            color={skinColor}
            roughness={0.6}
            metalness={0.1}
            emissive={isDarkMode ? skinColor : undefined}
            emissiveIntensity={emissiveIntensity * 0.5}
          />
        </mesh>
        
        {/* Hair with more realistic styling */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.255, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={hairColor} 
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        
        {/* Face details */}
        <group position={[0, 0, 0.2]}>
          {/* Eyes */}
          <mesh position={[0.08, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[-0.08, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          
          {/* Pupils with tracking effect */}
          <mesh position={[0.08, 0.05, 0.03]} castShadow>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color="#342D7E" 
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.03]} castShadow>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color="#342D7E" 
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          
          {/* Mouth - subtle smile */}
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.12, 0.02, 0.01]} />
            <meshStandardMaterial 
              color="#8D5524" 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          
          {/* Eyebrows */}
          <mesh position={[0.08, 0.13, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[-0.08, 0.13, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      </group>
      
      {/* Neck */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.6}
          emissive={isDarkMode ? skinColor : undefined}
          emissiveIntensity={emissiveIntensity * 0.5}
        />
      </mesh>
      
      {/* Torso with JPMC branding */}
      <group position={[0, 1.05, 0]}>
        {/* Main body - business shirt */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.32, 0.85, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.4}
            metalness={0.1}
            emissive={isDarkMode ? "#AAAAAA" : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Business jacket */}
        <mesh castShadow receiveShadow position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.24, 0.34, 0.83, 16, 1, true, Math.PI * 0.25, Math.PI * 1.5]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.5}
            metalness={0.2}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* JPMC logo on chest */}
        <mesh position={[0, 0.1, 0.23]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.12, 0.01]} />
          <meshStandardMaterial 
            color={jpmcColors.primary} 
            roughness={0.2}
            metalness={0.3}
            emissive={jpmcColors.primary}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Name tag */}
        <mesh position={[-0.15, 0.25, 0.23]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.2}
            metalness={0.1}
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
      
      {/* Arms with animation and improved articulation */}
      <group position={[0.28, 1.2, 0]} rotation={[0, 0, Math.PI / 3 + armSwing * 0.3]}>
        {/* Upper arm - with jacket sleeve */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.38, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.5}
            metalness={0.2}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Elbow joint */}
        <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.5}
            metalness={0.2}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Forearm - shirt showing at wrist */}
        <group position={[0, -0.4, 0]} rotation={[0, 0, -0.4]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.38, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          
          {/* Hand */}
          <group position={[0, -0.22, 0]} rotation={[0, 0, 0.2]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial 
                color={skinColor} 
                roughness={0.6}
                emissive={isDarkMode ? skinColor : undefined}
                emissiveIntensity={emissiveIntensity * 0.5}
              />
            </mesh>
            
            {/* Fingers hint */}
            <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.07, 0.03, 0.06]} />
              <meshStandardMaterial 
                color={skinColor} 
                roughness={0.6}
                emissive={isDarkMode ? skinColor : undefined}
                emissiveIntensity={emissiveIntensity * 0.5}
              />
            </mesh>
          </group>
        </group>
      </group>
      
      {/* Left arm */}
      <group position={[-0.28, 1.2, 0]} rotation={[0, 0, -Math.PI / 3 + armSwing * 0.3]}>
        {/* Upper arm - with jacket sleeve */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.38, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.5}
            metalness={0.2}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Elbow joint */}
        <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.5}
            metalness={0.2}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Forearm - shirt showing at wrist */}
        <group position={[0, -0.4, 0]} rotation={[0, 0, 0.4]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.38, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          
          {/* Hand */}
          <group position={[0, -0.22, 0]} rotation={[0, 0, -0.2]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial 
                color={skinColor} 
                roughness={0.6}
                emissive={isDarkMode ? skinColor : undefined}
                emissiveIntensity={emissiveIntensity * 0.5}
              />
            </mesh>
            
            {/* Phone in left hand */}
            <mesh position={[-0.04, -0.05, 0.04]} rotation={[-0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.1, 0.01]} />
              <meshStandardMaterial 
                color="#000000" 
                roughness={0.1}
                metalness={0.8}
                emissive={jpmcColors.accent}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        </group>
      </group>
      
      {/* Waist connection - belt */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.05, 16]} />
        <meshStandardMaterial 
          color="#222222" 
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>
      
      {/* Legs with animation and better articulation */}
      {/* Right leg */}
      <group position={[0.12, 0.6, 0]} rotation={[legSwing * 0.5, 0, 0]}>
        {/* Upper leg - dress pants */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.45, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.6}
            metalness={0.1}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity * 0.7}
          />
        </mesh>
        
        {/* Knee joint */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.6}
            metalness={0.1}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity * 0.7}
          />
        </mesh>
        
        {/* Lower leg */}
        <group position={[0, -0.45, 0.05]} rotation={[legSwing * 0.7, 0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.45, 16]} />
            <meshStandardMaterial 
              color={jpmcColors.secondary} 
              roughness={0.6}
              metalness={0.1}
              emissive={isDarkMode ? jpmcColors.secondary : undefined}
              emissiveIntensity={emissiveIntensity * 0.7}
            />
          </mesh>
          
          {/* Ankle */}
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color={jpmcColors.secondary} 
              roughness={0.6}
              metalness={0.1}
              emissive={isDarkMode ? jpmcColors.secondary : undefined}
              emissiveIntensity={emissiveIntensity * 0.7}
            />
          </mesh>
          
          {/* Foot with improved shape */}
          <mesh position={[0, -0.32, 0.08]} castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.06, 0.2]} />
            <meshStandardMaterial 
              color="#111111" 
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        </group>
      </group>
      
      {/* Left leg */}
      <group position={[-0.12, 0.6, 0]} rotation={[-legSwing * 0.5, 0, 0]}>
        {/* Upper leg - dress pants */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.45, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.6}
            metalness={0.1}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity * 0.7}
          />
        </mesh>
        
        {/* Knee joint */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial 
            color={jpmcColors.secondary} 
            roughness={0.6}
            metalness={0.1}
            emissive={isDarkMode ? jpmcColors.secondary : undefined}
            emissiveIntensity={emissiveIntensity * 0.7}
          />
        </mesh>
        
        {/* Lower leg */}
        <group position={[0, -0.45, -0.05]} rotation={[-legSwing * 0.7, 0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.45, 16]} />
            <meshStandardMaterial 
              color={jpmcColors.secondary} 
              roughness={0.6}
              metalness={0.1}
              emissive={isDarkMode ? jpmcColors.secondary : undefined}
              emissiveIntensity={emissiveIntensity * 0.7}
            />
          </mesh>
          
          {/* Ankle */}
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color={jpmcColors.secondary} 
              roughness={0.6}
              metalness={0.1}
              emissive={isDarkMode ? jpmcColors.secondary : undefined}
              emissiveIntensity={emissiveIntensity * 0.7}
            />
          </mesh>
          
          {/* Foot with improved shape */}
          <mesh position={[0, -0.32, -0.08]} castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.06, 0.2]} />
            <meshStandardMaterial 
              color="#111111" 
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        </group>
      </group>
      
      {/* Light effect for visibility in dark mode */}
      {isDarkMode && (
        <pointLight position={[0, 1, 0]} intensity={0.5} distance={2} color="#FFFFFF" />
      )}
    </group>
  );
};

export default Enhanced3DPerson;
