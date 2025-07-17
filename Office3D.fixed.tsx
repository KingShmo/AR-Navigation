import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { jpmcColors } from './jpmcTheme';
import './App.css';

interface Office3DProps {
  destination?: string;
  isDarkMode?: boolean;
  navMode?: 'walking' | 'wheelchair' | 'stairs' | 'elevator';
}

function Office3D({ destination = 'Meeting Room', isDarkMode = false, navMode = 'walking' }: Office3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'left' | 'right' | 'stairs' | 'elevator'>('forward');
  const [etaSeconds, setEtaSeconds] = useState(180);
  const [distanceFeet, setDistanceFeet] = useState(60);

  // Reference to person group for external access
  const personGroupRef = useRef<THREE.Group | null>(null);
  
  // Reference to the animation frame for cleanup
  const animationFrameRef = useRef<number | null>(null);
  useEffect(() => {
    console.log("Fixed Office3D component mounting for destination:", destination);
    
    // Set loading state
    setIsLoading(true);
    
    const mount = mountRef.current;
    if (!mount) {
      console.error("Mount ref is not available");
      return;
    }

    setMounted(true);
      // Set a timer to hide the loading indicator after the scene is likely rendered
    const loadingTimer = setTimeout(() => {
      console.log("Office3D rendering complete, hiding loading indicator");
      setIsLoading(false);
    }, 1500);
    
    // Store the timer reference for cleanup
    const loadingTimerRef = useRef(loadingTimer);

    // Scene setup with enhanced visuals
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? jpmcColors.dark : jpmcColors.background);

    // Camera with better positioning for a more dynamic view
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 4, 8); // Higher and slightly further back for better overview
    camera.lookAt(0, 1, 0);

    // Enhanced renderer with better shadow quality
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Enhanced lighting system
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? '#1a2338' : jpmcColors.white, 
      isDarkMode ? 0.3 : 0.6
    );
    scene.add(ambientLight);
    
    // Main directional light
    const dirLight = new THREE.DirectionalLight(
      isDarkMode ? '#6a8ad2' : jpmcColors.white, 
      isDarkMode ? 0.5 : 0.8
    );
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Enhanced floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? '#1c2c4a' : jpmcColors.gray,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Office Walls
    const createWall = (width: number, height: number, depth: number, x: number, y: number, z: number) => {
      const wallGeometry = new THREE.BoxGeometry(width, height, depth);
      const wallMaterial = new THREE.MeshStandardMaterial({ color: isDarkMode ? '#1e3756' : '#f0f0f0' });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
      return wall;
    };

    // Create office boundaries
    createWall(20, 4, 0.2, 0, 2, -10); // Back wall
    createWall(0.2, 4, 20, -10, 2, 0); // Left wall
    createWall(0.2, 4, 20, 10, 2, 0);  // Right wall

    // Meeting room (destination)
    const meetingRoom = new THREE.Group();
    
    // Meeting room walls
    const roomWall1 = createWall(6, 3, 0.2, -4, 1.5, -5);
    const roomWall2 = createWall(0.2, 3, 4, -7, 1.5, -7);
    const roomWall3 = createWall(6, 3, 0.2, -4, 1.5, -9);
    
    // Meeting room sign
    const signGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({ 
      color: jpmcColors.primary,
      emissive: jpmcColors.primary,
      emissiveIntensity: isDarkMode ? 0.5 : 0.2
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-4, 2.8, -4.9);
    
    meetingRoom.add(roomWall1, roomWall2, roomWall3, sign);
    scene.add(meetingRoom);

    // Add several desks
    const addDesk = (x: number, z: number) => {
      const deskGroup = new THREE.Group();
      
      const deskGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.8);
      const deskMaterial = new THREE.MeshStandardMaterial({ color: '#D2B48C' });
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.position.y = 0.5;
      desk.castShadow = true;
      desk.receiveShadow = true;
      
      deskGroup.add(desk);
      deskGroup.position.set(x, 0, z);
      scene.add(deskGroup);
    };

    // Add several desks in an organized layout
    addDesk(2, -3);
    addDesk(4, -3);
    addDesk(6, -3);
    addDesk(2, -1);
    addDesk(4, -1);
    addDesk(6, -1);

    // Create 3D person
    const personGroup = new THREE.Group();
    personGroupRef.current = personGroup;
    
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: jpmcColors.primary });
    
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), bodyMaterial);
    head.position.set(0, 1.6, 0);
    head.castShadow = true;
    
    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.8, 32), bodyMaterial);
    body.position.set(0, 1.1, 0);
    body.castShadow = true;
    
    personGroup.add(head, body);
    scene.add(personGroup);
    
    // Navigation path
    // Determine path points based on destination
    let pathPoints: THREE.Vector3[] = [];
    let destinationPoint: THREE.Vector3;
    
    switch(destination) {
      case 'Meeting Room':
      case 'Meeting Room A':
        destinationPoint = new THREE.Vector3(-4, 0.05, -7);
        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),         // Start
          new THREE.Vector3(3, 0.05, 0),         // Turn point
          new THREE.Vector3(3, 0.05, -4),        // Second turn
          new THREE.Vector3(-2, 0.05, -4),       // Approaching meeting room
          destinationPoint                       // Meeting room
        ];
        break;
      case 'Executive Office':
        destinationPoint = new THREE.Vector3(7, 0.05, 7);
        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),        // Start
          new THREE.Vector3(3, 0.05, 0),        // First turn
          new THREE.Vector3(3, 0.05, 3),        // Second turn
          new THREE.Vector3(7, 0.05, 3),        // Third turn
          destinationPoint                      // Executive office
        ];
        break;
      case 'Cafeteria':
        destinationPoint = new THREE.Vector3(7, 0.05, -8);
        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),        // Start
          new THREE.Vector3(3, 0.05, 0),        // First turn
          new THREE.Vector3(3, 0.05, -4),       // Second turn
          new THREE.Vector3(7, 0.05, -4),       // Third turn
          destinationPoint                      // Cafeteria
        ];
        break;
      default:
        destinationPoint = new THREE.Vector3(-4, 0.05, -7);
        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),
          new THREE.Vector3(3, 0.05, 0),
          new THREE.Vector3(3, 0.05, -4),
          new THREE.Vector3(-2, 0.05, -4),
          destinationPoint
        ];
    }
    
    // Create a visible path
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ 
      color: isDarkMode ? jpmcColors.accentBlue : jpmcColors.accent,
      linewidth: 3
    });
    const path = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(path);
    
    // Add destination marker
    const destinationMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32),
      new THREE.MeshStandardMaterial({
        color: jpmcColors.accentOrange,
        emissive: jpmcColors.accentOrange,
        emissiveIntensity: 0.3
      })
    );
    destinationMarker.position.copy(destinationPoint);
    destinationMarker.position.y = 0.05;
    scene.add(destinationMarker);

    // Animation points
    const animationPoints: THREE.Vector3[] = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      const distance = start.distanceTo(end);
      const steps = Math.ceil(distance / 0.02); // 0.02 is the animation speed
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const point = new THREE.Vector3().lerpVectors(start, end, t);
        animationPoints.push(point);
      }
    }
    
    let frame = 0;
    let pathIndex = 0;
    
    function animate() {
      frame++;
      
      // Move the person along the path
      if (pathIndex < animationPoints.length) {
        const point = animationPoints[pathIndex];
        if (personGroup) {
          personGroup.position.x = point.x;
          personGroup.position.z = point.z;
          
          // Calculate rotation for next point
          if (pathIndex + 1 < animationPoints.length) {
            const nextPoint = animationPoints[pathIndex + 1];
            const direction = new THREE.Vector2(
              nextPoint.x - point.x,
              nextPoint.z - point.z
            );
            
            if (direction.length() > 0.001) {
              const angle = Math.atan2(direction.y, direction.x);
              personGroup.rotation.y = -angle;
            }
          }
        }
        
        // Increment path index for next frame
        pathIndex += 1;
      }
      
      // If we've reached the end of our path, loop back to beginning
      if (pathIndex >= animationPoints.length) {
        pathIndex = 0;
        if (personGroup) {
          personGroup.position.set(0, 0, 0);
        }
      }
      
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Hide loading state once first frame is rendered
      if (isLoading) {
        setIsLoading(false);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle window resizing
    const handleResize = () => {
      if (!mount) return;
      
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);    // Cleanup
    return () => {
      console.log("Office3D component unmounting and cleaning up");
      window.removeEventListener('resize', handleResize);
      
      // Cancel any animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Remove renderer from DOM
      if (mount && renderer && mount.contains(renderer.domElement)) {
        try {
          mount.removeChild(renderer.domElement);
        } catch (error) {
          console.error("Error removing renderer DOM element:", error);
        }
      }
      
      // Clear any scene resources
      if (scene) {
        scene.clear();
      }
      
      // Clear any loading timeouts
      clearTimeout(loadingTimer);
    };
  }, [destination, isDarkMode, navMode]); // Re-render when these props change

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.background,
      borderRadius: '8px'
    }}>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: isDarkMode ? jpmcColors.accentBlue : jpmcColors.primary,
          fontWeight: 'bold',
          zIndex: 10,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)'
        }}>
          Loading Enhanced 3D Office...
        </div>
      )}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '12px',
          boxShadow: `0 2px 16px ${jpmcColors.secondary}40`, 
          margin: 'auto',
          position: 'relative',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
}

export default Office3D;
