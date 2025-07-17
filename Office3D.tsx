import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { jpmcColors } from './jpmcTheme';
import './App.css';

interface Office3DProps {
  destination?: string;
  destinationPosition?: { x: number; y: number; z: number };
}

function Office3D({ destination = 'Meeting Room', destinationPosition = { x: -5, y: 0, z: -7 } }: Office3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    setMounted(true);
    console.log("Office3D component mounting");

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(jpmcColors.background);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(jpmcColors.white, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(jpmcColors.white, 0.8);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: jpmcColors.gray,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Office Walls
    const createWall = (width: number, height: number, depth: number, x: number, y: number, z: number) => {
      const wallGeometry = new THREE.BoxGeometry(width, height, depth);
      const wallMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0' });
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
    
    // Meeting room table
    const tableGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(-4, 1, -7);
    table.castShadow = true;
    table.receiveShadow = true;
    
    // Meeting room sign
    const signGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({ color: jpmcColors.primary });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-4, 2.5, -4.9);
    
    meetingRoom.add(roomWall1, roomWall2, roomWall3, table, sign);
    scene.add(meetingRoom);

    // Desks
    const addDesk = (x: number, z: number) => {
      const deskGroup = new THREE.Group();
      
      // Desk
      const deskGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.8);
      const deskMaterial = new THREE.MeshStandardMaterial({ color: '#D2B48C' });
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.position.y = 0.5;
      desk.castShadow = true;
      desk.receiveShadow = true;
      
      // Computer monitor
      const monitorStandGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
      const monitorStandMaterial = new THREE.MeshStandardMaterial({ color: '#555' });
      const monitorStand = new THREE.Mesh(monitorStandGeometry, monitorStandMaterial);
      monitorStand.position.y = 0.675;
      
      const monitorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.03);
      const monitorMaterial = new THREE.MeshStandardMaterial({ color: '#111' });
      const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
      monitor.position.y = 0.8;
      
      // Chair
      const chairSeatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
      const chairMaterial = new THREE.MeshStandardMaterial({ color: '#333' });
      const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
      chairSeat.position.set(0, 0.3, 0.5);
      
      const chairBackGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
      const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
      chairBack.position.set(0, 0.55, 0.75);
      
      deskGroup.add(desk, monitorStand, monitor, chairSeat, chairBack);
      deskGroup.position.set(x, 0, z);
      scene.add(deskGroup);
    };

    // Add several desks
    addDesk(2, -3);
    addDesk(4, -3);
    addDesk(6, -3);
    addDesk(2, -1);
    addDesk(4, -1);
    addDesk(6, -1);

    // Simple 3D person (blue avatar)
    const personGroup = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: jpmcColors.primary });
    
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), bodyMaterial);
    head.position.set(0, 1.6, 0);
    head.castShadow = true;
    
    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.8, 32), bodyMaterial);
    body.position.set(0, 1.1, 0);
    body.castShadow = true;
    
    // Arms
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16), bodyMaterial);
    leftArm.position.set(0.3, 1.1, 0);
    leftArm.rotation.z = Math.PI / 3;
    leftArm.castShadow = true;
    
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16), bodyMaterial);
    rightArm.position.set(-0.3, 1.1, 0);
    rightArm.rotation.z = -Math.PI / 3;
    rightArm.castShadow = true;
    
    // Legs
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.8, 16), bodyMaterial);
    leftLeg.position.set(0.15, 0.4, 0);
    leftLeg.castShadow = true;
    
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.8, 16), bodyMaterial);
    rightLeg.position.set(-0.15, 0.4, 0);
    rightLeg.castShadow = true;
    
    personGroup.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    scene.add(personGroup);
      // Navigation path (visible line showing the path)
    const pathPoints = [
      new THREE.Vector3(0, 0.05, 0),         // Start
      new THREE.Vector3(3, 0.05, 0),         // Turn point
      new THREE.Vector3(3, 0.05, destinationPosition.z > 0 ? destinationPosition.z / 2 : -4),        // Second turn
      new THREE.Vector3(destinationPosition.x < 0 ? destinationPosition.x + 2 : 3, 0.05, destinationPosition.z > 0 ? destinationPosition.z / 2 : -4),       // Approaching destination
      new THREE.Vector3(destinationPosition.x, 0.05, destinationPosition.z)        // Destination
    ];
    
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: jpmcColors.accent, linewidth: 3 });
    const path = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(path);

    // Walking animation
    let frame = 0;
    let pathIndex = 0;
    const animationSpeed = 0.02;
    
    // Points to follow for the avatar
    interface AnimationPoint extends THREE.Vector3 {}

    const animationPoints: AnimationPoint[] = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      const distance = start.distanceTo(end);
      const steps = Math.ceil(distance / animationSpeed);
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const point = new THREE.Vector3().lerpVectors(start, end, t);
        animationPoints.push(point);
      }
    }
    
    function animate() {
      frame++;
      
      // Move the person along the path
      if (pathIndex < animationPoints.length) {
        const point = animationPoints[pathIndex];
        personGroup.position.x = point.x;
        personGroup.position.z = point.z;
        
        // Calculate the direction for the next position
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
        
        // Animate legs while walking
        const legSwing = Math.sin(frame * 0.2) * 0.3;
        if (leftLeg && rightLeg) {
          leftLeg.rotation.x = legSwing;
          rightLeg.rotation.x = -legSwing;
        }
        
        // Increment path index for next frame
        pathIndex += 1;
      }
      
      // If we've reached the end of our path, loop back to beginning
      if (pathIndex >= animationPoints.length) {
        pathIndex = 0;
        personGroup.position.set(0, 0, 0);
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
      
      // Hide loading state once first frame is rendered
      if (isLoading) {
        setIsLoading(false);
      }
    }
    animate();

    // Handle window resizing
    const handleResize = () => {
      if (!mount) return;
      
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [destination]); // Re-render when destination changes

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: jpmcColors.background,
      borderRadius: '8px'
    }}>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: jpmcColors.primary,
          fontWeight: 'bold',
          fontSize: '20px',
          zIndex: 10,
          background: 'rgba(255,255,255,0.8)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          Loading 3D Office Environment...
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
