import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { jpmcColors } from './jpmcTheme';
import './App.css';

// Create materials with better properties
const wallMaterial = new THREE.MeshStandardMaterial({
  color: '#f0f0f0',
  roughness: 0.9,
  metalness: 0.1,
});

const accentWallMaterial = new THREE.MeshStandardMaterial({
  color: jpmcColors.accentBlue,
  roughness: 0.7,
  metalness: 0.2,
});

const artMaterial = new THREE.MeshStandardMaterial({
  color: jpmcColors.accentGreen,
  roughness: 0.5,
  metalness: 0.3,
});

// Create carpet pattern
const createCarpetTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill base color
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, size, size);

  // Add noise pattern
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const brightness = 0.95 + Math.random() * 0.1;
    ctx.fillStyle = `rgba(200, 200, 200, ${brightness})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Add subtle grid pattern
  ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += size / 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};

const floorMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.8,
  metalness: 0.1,
  map: createCarpetTexture(),
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: '#88ccff',
  transparent: true,
  opacity: 0.3,
  roughness: 0.2,
  metalness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

const woodMaterial = new THREE.MeshStandardMaterial({
  color: '#8B4513',
  roughness: 0.8,
  metalness: 0.2,
});

interface Office3DProps {
  destination?: string;
  isDarkMode?: boolean;
  navMode?: string;
  etaSeconds?: number;
  distanceFeet?: number;
}

// Enhanced navigation bar styles
const navBarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 64,
  background: `linear-gradient(90deg, ${jpmcColors.primary} 70%, ${jpmcColors.accentBlue} 100%)`,
  color: '#fff',
  fontWeight: 800,
  fontSize: '2rem',
  letterSpacing: '0.04em',
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  zIndex: 30,
  paddingLeft: 32,
  borderBottom: `4px solid ${jpmcColors.accentGreen}`
};

// Movement flags must persist for the lifetime of the component
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

const Office3D: React.FC<Office3DProps> = ({ destination = 'Innovation Lab', isDarkMode = false, navMode = 'walking', etaSeconds = 0, distanceFeet = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let controls: OrbitControls;
    let personMesh: THREE.Group | null = null;
    let personPath: Array<{ x: number, z: number }> = [];
    let personStep = 0;
    let personSpeed = 0.04;
    let walkPhase = 0;
    let animationFrameId: number;

    // First-person movement
    const handleKeyDown = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'w': case 'ArrowUp': moveForward = true; break;
        case 's': case 'ArrowDown': moveBackward = true; break;
        case 'a': case 'ArrowLeft': moveLeft = true; break;
        case 'd': case 'ArrowRight': moveRight = true; break;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'w': case 'ArrowUp': moveForward = false; break;
        case 's': case 'ArrowDown': moveBackward = false; break;
        case 'a': case 'ArrowLeft': moveLeft = false; break;
        case 'd': case 'ArrowRight': moveRight = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    try {
      console.log("✨ Initializing Office3D with:", { destination, isDarkMode, navMode });
      
      if (!mountRef.current) {
        console.warn("Mount ref is not available");
        setIsLoading(false);
        return;
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDarkMode ? '#1a2338' : '#ffffff');
      console.log("Scene created");

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.set(5, 1.6, -12); // Start near entrance, eye level
      camera.lookAt(5, 1.6, -10);

      // Enhanced renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);

      // Enhanced lighting
      const ambientLight = new THREE.AmbientLight(
        isDarkMode ? '#1a2338' : '#ffffff',
        isDarkMode ? 0.3 : 0.5
      );
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(
        isDarkMode ? '#6a8ad2' : '#ffffff',
        isDarkMode ? 0.7 : 1.0
      );
      dirLight.position.set(5, 10, 7.5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      scene.add(dirLight);

      // Add point lights for better ambiance
      const addPointLight = (x: number, y: number, z: number, intensity: number, color: string) => {
        const light = new THREE.PointLight(color, intensity);
        light.position.set(x, y, z);
        scene.add(light);
      };

      addPointLight(5, 5, 5, 0.5, '#ffffff');
      addPointLight(-5, 5, -5, 0.5, '#ffffff');
      addPointLight(0, 3, 0, 0.3, '#ffffff');

      // Enhanced floor with carpet texture
      const floorGeometry = new THREE.PlaneGeometry(30, 30, 32, 32);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.receiveShadow = true;
      scene.add(floor);

      // Subtle grid helper
      const gridHelper = new THREE.GridHelper(30, 60, isDarkMode ? 0x333333 : 0xdddddd, isDarkMode ? 0x222222 : 0xeeeeee);
      gridHelper.position.y = 0.002; // Just above the floor
      gridHelper.material.opacity = 0.3;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);

      // Ceiling
      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 4;
      ceiling.receiveShadow = true;
      scene.add(ceiling);

      // Office layout helper function
      const createWall = (width: number, height: number, depth: number, x: number, y: number, z: number, material = wallMaterial) => {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, depth),
          material
        );
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        return wall;
      };

      // Main office layout
      createWall(30, 4, 0.2, 0, 2, -15);  // Back wall
      createWall(0.2, 4, 30, -15, 2, 0);  // Left wall
      createWall(0.2, 4, 30, 15, 2, 0);   // Right wall

      // Accent wall
      createWall(8, 4, 0.2, 8, 2, -15, accentWallMaterial); // Right accent wall

      // Art piece
      const art = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.1), artMaterial);
      art.position.set(10, 2.5, -14.9);
      scene.add(art);

      // Meeting room
      createWall(8, 4, 0.2, -8, 2, -8);    // Back wall
      createWall(0.2, 4, 6, -12, 2, -5);   // Side wall
      createWall(8, 4, 0.2, -8, 2, -2);    // Front wall with door gap
      
      // Glass walls for meeting room
      const glassWall = new THREE.Mesh(
        new THREE.BoxGeometry(6, 3, 0.1),
        glassMaterial
      );
      glassWall.position.set(-8, 2, -5);
      scene.add(glassWall);

      // Meeting room table
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 1.5),
        woodMaterial
      );
      table.position.set(-8, 1, -5);
      table.castShadow = true;
      table.receiveShadow = true;
      scene.add(table);

      // Add chairs around the table
      const chairPositions = [
        [-9.5, -5.5], [-8, -5.5], [-6.5, -5.5], // One side
        [-9.5, -4.5], [-8, -4.5], [-6.5, -4.5]  // Other side
      ];

      chairPositions.forEach(([x, z]) => {
        const chair = new THREE.Group();
        
        // Chair seat
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.1, 0.4),
          woodMaterial
        );
        seat.position.y = 0.5;
        
        // Chair back
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.6, 0.1),
          woodMaterial
        );
        back.position.set(0, 0.8, -0.15);
        
        chair.add(seat, back);
        chair.position.set(x, 0, z);
        chair.castShadow = true;
        scene.add(chair);
      });

      // Add office desks
      const deskPositions = [
        [5, -10], [8, -10], [11, -10],
        [5, -6], [8, -6], [11, -6],
        [5, -2], [8, -2], [11, -2]
      ];

      deskPositions.forEach(([x, z]) => {
        // Desk
        const desk = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.1, 1),
          woodMaterial
        );
        desk.position.set(x, 0.7, z);
        desk.castShadow = true;
        scene.add(desk);

        // Monitor
        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.5, 0.1),
          new THREE.MeshStandardMaterial({ color: '#333333' })
        );
        monitor.position.set(x, 1.2, z - 0.3);
        monitor.castShadow = true;
        scene.add(monitor);

        // Chair
        const chair = new THREE.Group();
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.1, 0.4),
          woodMaterial
        );
        seat.position.y = 0.5;
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.6, 0.1),
          woodMaterial
        );
        back.position.set(0, 0.8, -0.15);
        chair.add(seat, back);
        chair.position.set(x, 0, z + 0.7);
        chair.castShadow = true;
        scene.add(chair);
      });

      // Add decorative plants
      const plantPositions = [
        [-13, -1], [13, -1], [0, -14],
        [-13, -14], [13, -14]
      ];

      plantPositions.forEach(([x, z]) => {
        const plant = new THREE.Group();
        
        // Pot
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.2, 0.4),
          new THREE.MeshStandardMaterial({ color: '#654321' })
        );
        
        // Plant (sphere for simplicity)
        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(0.4),
          new THREE.MeshStandardMaterial({ color: '#228B22' })
        );
        leaves.position.y = 0.5;
        
        plant.add(pot, leaves);
        plant.position.set(x, 0, z);
        plant.castShadow = true;
        plant.receiveShadow = true;
        scene.add(plant);
      });

      // Add animated 3D person
      personMesh = new THREE.Group();
      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), new THREE.MeshStandardMaterial({ color: '#fbeee6' }));
      head.position.y = 1.7;
      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.8, 24), new THREE.MeshStandardMaterial({ color: jpmcColors.primary }));
      body.position.y = 1.1;
      // Left arm
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16), new THREE.MeshStandardMaterial({ color: '#fbeee6' }));
      leftArm.position.set(-0.22, 1.3, 0);
      leftArm.rotation.z = Math.PI / 5;
      // Right arm
      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16), new THREE.MeshStandardMaterial({ color: '#fbeee6' }));
      rightArm.position.set(0.22, 1.3, 0);
      rightArm.rotation.z = -Math.PI / 5;
      // Left leg
      const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 16), new THREE.MeshStandardMaterial({ color: jpmcColors.secondary }));
      leftLeg.position.set(-0.12, 0.3, 0);
      // Right leg
      const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 16), new THREE.MeshStandardMaterial({ color: jpmcColors.secondary }));
      rightLeg.position.set(0.12, 0.3, 0);
      personMesh.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
      scene.add(personMesh);

      // Path for person to walk to Innovation Lab (avoiding desks)
      personPath = [
        { x: 5, z: -10 }, // Start
        { x: 5, z: -12 }, // Move back to avoid desks
        { x: 0, z: -12 }, // Move left, behind desks
        { x: 0, z: -2 }, // Move up, left of desks
        { x: 10, z: 0 }, // Innovation Lab
      ];
      personStep = 0;

      // Draw navigation path line
      const pathPoints = personPath.map(p => new THREE.Vector3(p.x, 0.05, p.z));
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const pathMaterial = new THREE.LineDashedMaterial({
        color: jpmcColors.accentGreen,
        dashSize: 1,
        gapSize: 0.5,
        linewidth: 2
      });
      const pathLine = new THREE.Line(pathGeometry, pathMaterial);
      pathLine.computeLineDistances();
      scene.add(pathLine);

      // Add destination marker
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: jpmcColors.accentGreen, emissive: jpmcColors.accentGreen, emissiveIntensity: 0.5 })
      );
      marker.position.set(10, 0.06, 0);
      scene.add(marker);

      // Add floating label for Innovation Lab
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font: any) {
        const textGeometry = new TextGeometry('Innovation Lab', {
          font: font,
          size: 0.7,
          depth: 0.05,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: jpmcColors.accentGreen });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(9, 2.2, 0);
        scene.add(textMesh);
      }, undefined, () => {
        // Fallback: add a simple box as label if font fails
        const fallbackLabel = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.5, 0.1),
          new THREE.MeshStandardMaterial({ color: jpmcColors.accentGreen })
        );
        fallbackLabel.position.set(9, 2.2, 0);
        scene.add(fallbackLabel);
      });

      // Enhanced orbit controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05; // Smoother damping
      controls.minDistance = 1.5;
      controls.maxDistance = 40;
      controls.maxPolarAngle = Math.PI / 1.8; // Limit looking down angle
      controls.minPolarAngle = Math.PI / 8; // Limit looking up angle
      controls.target.set(5, 1.6, -10); // Look at head height by default
      controls.enablePan = true;
      controls.screenSpacePanning = true; // Makes panning more intuitive
      controls.panSpeed = 2.0;
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.5;
      controls.keyPanSpeed = 20; // Faster keyboard pan

      // Prevent mouse controls in nav bar area
      renderer.domElement.addEventListener('pointerdown', (e) => {
        if (e.clientY < 72) {
          controls.enabled = false;
        } else {
          controls.enabled = true;
        }
      });
      renderer.domElement.addEventListener('pointerup', () => {
        controls.enabled = true;
      });

      // Handle window resizing
      const handleResize = () => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Camera movement
        const moveSpeed = 0.15;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        if (moveForward) {
          camera.position.addScaledVector(dir, moveSpeed);
        }
        if (moveBackward) {
          camera.position.addScaledVector(dir, -moveSpeed);
        }
        if (moveLeft) {
          const left = new THREE.Vector3().crossVectors(camera.up, dir).normalize();
          camera.position.addScaledVector(left, moveSpeed);
        }
        if (moveRight) {
          const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
          camera.position.addScaledVector(right, moveSpeed);
        }
        controls.update();

        // Animate person walking
        if (personMesh && personPath.length > 0) {
          const target = personPath[personStep];
          if (target) {
            const dx = target.x - personMesh.position.x;
            const dz = target.z - personMesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.05) {
              personMesh.position.x += dx * personSpeed * 0.5;
              personMesh.position.z += dz * personSpeed * 0.5;
              walkPhase += 0.1;
              personMesh.position.y = 0.2 * Math.sin(walkPhase);
            } else {
              personStep = Math.min(personStep + 1, personPath.length - 1);
            }
          }
        }

        renderer.render(scene, camera);
      };
      animate();
      console.log("Animation loop started");

      setIsLoading(false);

      // Cleanup function
      return () => {
        try {
          console.log("Cleaning up scene");
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          
          cancelAnimationFrame(animationFrameId);
          
          if (mountRef.current && renderer.domElement) {
            try {
              mountRef.current.removeChild(renderer.domElement);
            } catch (e) {
              console.warn("Could not remove renderer element:", e);
            }
          }
          
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
            }
          });
          
          scene.clear();
          renderer.dispose();
          controls.dispose();
        } catch (error) {
          console.error("Error during cleanup in Office3D:", error);
        }
      };
    } catch (error) {
      console.error("Error in Office3D:", error);
      setIsLoading(false);
    }
  }, [destination, isDarkMode, navMode]);

  return (
    <div style={{
      width: '100%',
      height: '80vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#1a2338' : '#ffffff',
      borderRadius: '12px',
      margin: '24px auto',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      {/* JPMorgan Chase Navigation Bar */}
      <div style={navBarStyle}>
        JPMorgan Chase AR Navigation
      </div>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          Loading office environment...
        </div>
      )}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />
      {/* Metrics overlay - show ETA and distance only, no nav instructions */}
      <div style={{
        position: 'absolute',
        top: 80,
        right: 16,
        background: 'rgba(255,255,255,0.95)',
        color: jpmcColors.primary,
        borderRadius: 8,
        padding: '14px 22px',
        fontWeight: 600,
        fontSize: '1.15rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        zIndex: 20,
        minWidth: 220
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: jpmcColors.accentBlue, marginBottom: 6 }}>
          Metrics
        </div>
        <div style={{ fontWeight: 700, color: jpmcColors.accentGreen }}>
          {distanceFeet > 0 ? `${distanceFeet} ft ahead` : 'Arrived!'}
        </div>
        <div style={{ fontWeight: 600, color: jpmcColors.accentBlue }}>
          {etaSeconds > 0 ? `ETA: ${Math.floor(etaSeconds/60)}:${(etaSeconds%60).toString().padStart(2,'0')}` : 'ETA: 0:00'}
        </div>
      </div>
    </div>
  );
};

export default Office3D;
