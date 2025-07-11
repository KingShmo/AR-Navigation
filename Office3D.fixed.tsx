// filepath: c:\Users\N811063\OneDrive - JPMorgan Chase\jpmc-ar-nav\src\Office3D.fixed.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { jpmcColors } from './jpmcTheme';
import './App.css';

// Create materials with better properties
const wallMaterial = new THREE.MeshStandardMaterial({
  color: '#f0f0f0',
  roughness: 0.9,
  metalness: 0.1,
});

// Create carpet texture safely
const createCarpetTexture = (): THREE.Texture | null => {
  try {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error("Failed to get 2D context for carpet texture");
      return null;
    }

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
  } catch (error) {
    console.error("Error creating carpet texture:", error);
    return null;
  }
};

// Create materials with safe fallbacks
const createFloorMaterial = (): THREE.MeshStandardMaterial => {
  try {
    const carpetTexture = createCarpetTexture();
    return new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.8,
      metalness: 0.1,
      map: carpetTexture || undefined,
    });
  } catch (error) {
    console.error("Error creating floor material:", error);
    return new THREE.MeshStandardMaterial({
      color: '#e8e8e8',
      roughness: 0.8,
      metalness: 0.1,
    });
  }
};

// Removed unused materials

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

const navigationSteps = [
  { instruction: 'Continue straight for 20 ft', distance: 20 },
  { instruction: 'Turn left and proceed for 30 ft', distance: 30 },
  { instruction: 'Turn right and continue for 10 ft', distance: 10 },
  { instruction: 'Arrived at Innovation Lab', distance: 0 }
];

interface Office3DProps {
  destination?: string;
  isDarkMode?: boolean;
  navMode?: string;
}

const Office3D: React.FC<Office3DProps> = ({ 
  destination = 'Innovation Lab', 
  isDarkMode = false, 
  navMode = 'walking' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);  const [isLoading, setIsLoading] = useState(true);
  const [distanceFeet, setDistanceFeet] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [currentStep] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Clean up resources properly
  const cleanupResources = useCallback(() => {
    try {
      console.log("Cleaning up scene");
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      if (mountRef.current && rendererRef.current?.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn("Could not remove renderer element:", e);
        }
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
        
        sceneRef.current.clear();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    } catch (error) {
      console.error("Error during cleanup in Office3D:", error);
    }
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !sceneRef.current) return;
    
    const camera = sceneRef.current.children.find(child => child instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
    if (!camera) return;
    
    camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    camera.updateProjectionMatrix();
    rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
  }, []);

  // Initialize the scene
  useEffect(() => {
    // Handle keyboard movement    const handleKeyDown = (event: KeyboardEvent) => {
      // Basic keyboard handling - could be expanded
      console.log("Key pressed:", event.key);
    };

    const handleKeyUp = () => {
      // Handle keyboard release - could be expanded
    };
    
    try {
      console.log("✨ Initializing Office3D with:", { destination, isDarkMode, navMode });
      
      if (!mountRef.current) {
        const error = "Mount ref is not available";
        console.warn(error);
        setHasError(true);
        setErrorMessage(error);
        setIsLoading(false);
        return cleanupResources;
      }

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(isDarkMode ? '#1a2338' : '#ffffff');
      console.log("Scene created");

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.set(5, 1.6, -12); // Start near entrance, eye level
      camera.lookAt(5, 1.6, -10);
      scene.add(camera);

      // Enhanced renderer setup with error handling
      try {
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true
        });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
      } catch (error) {
        console.error("Failed to create WebGL renderer:", error);
        setHasError(true);
        setErrorMessage("WebGL initialization failed. Your browser may not support WebGL, or it may be disabled.");
        setIsLoading(false);
        return cleanupResources;
      }

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
      const floor = new THREE.Mesh(floorGeometry, createFloorMaterial());
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.receiveShadow = true;
      scene.add(floor);

      // Subtle grid helper
      const gridHelper = new THREE.GridHelper(30, 60, isDarkMode ? 0x333333 : 0xdddddd, isDarkMode ? 0x222222 : 0xeeeeee);
      gridHelper.position.y = 0.002; // Just above the floor
      (gridHelper.material as THREE.Material).opacity = 0.3;
      (gridHelper.material as THREE.Material).transparent = true;
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

      // Create a simple person mesh
      const personGroup = new THREE.Group();
      
      // Body (blue cylinder)
      const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: jpmcColors.primary });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.7;
      personGroup.add(body);

      // Head (sphere)
      const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const headMaterial = new THREE.MeshStandardMaterial({ color: '#ffdbac' });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 1.15;
      personGroup.add(head);
      
      // Position person at start
      personGroup.position.set(5, 0, -12);
      scene.add(personGroup);

      // Controls
      const controls = new OrbitControls(camera, rendererRef.current.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 20;
      controls.maxPolarAngle = Math.PI / 2; // Don't go below ground
      controlsRef.current = controls;

      // Add window event listeners
      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Set distance and ETA
      setDistanceFeet(60);
      setEtaSeconds(120);

      // Animation loop with error handling
      const animate = () => {
        try {
          animationFrameRef.current = requestAnimationFrame(animate);
          
          if (controlsRef.current) {
            controlsRef.current.update();
          }
          
          if (rendererRef.current && sceneRef.current) {
            rendererRef.current.render(scene, camera);
          }
        } catch (error) {
          console.error("Error in animation loop:", error);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setHasError(true);
          setErrorMessage("Animation error: " + (error instanceof Error ? error.message : String(error)));
        }
      };
      
      // Start animation loop
      animate();
      console.log("Animation loop started");
      setIsLoading(false);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cleanupResources();
      };
    } catch (error) {
      console.error("Error in Office3D:", error);
      setHasError(true);
      setErrorMessage("Initialization error: " + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
      return cleanupResources;
    }
  }, [destination, isDarkMode, navMode, cleanupResources, handleResize]);

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        height: '80vh',
        position: 'relative',
        backgroundColor: isDarkMode ? '#1a2338' : '#ffffff',
        borderRadius: '12px',
        margin: '24px auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDarkMode ? '#ffffff' : '#000000'
      }}>
        <h3>Failed to load 3D office view</h3>
        <div style={{
          backgroundColor: isDarkMode ? '#0f172a' : '#f8f8f8',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '80%',
          marginBottom: '20px'
        }}>
          <p>{errorMessage}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: jpmcColors.accentBlue,
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

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
      {/* Navigation instructions overlay */}
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
        minWidth: 260
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: jpmcColors.accentBlue, marginBottom: 6 }}>
          Navigation Instructions
        </div>
        <div>WASD / Arrow keys: Move</div>
        <div>Mouse: Look / Pan / Zoom (except top bar)</div>
        <div style={{ marginTop: 8, fontWeight: 700, color: jpmcColors.accentGreen }}>
          {distanceFeet > 0 ? `${distanceFeet} ft ahead` : 'Arrived!'}
        </div>
        <div style={{ fontWeight: 600, color: jpmcColors.accentBlue }}>
          {etaSeconds > 0 ? `ETA: ${Math.floor(etaSeconds/60)}:${(etaSeconds%60).toString().padStart(2,'0')}` : 'ETA: 0:00'}
        </div>
        <div style={{ marginTop: 12, fontWeight: 700, color: jpmcColors.primary }}>
          Step-by-step: {navigationSteps[currentStep]?.instruction}
        </div>
      </div>
    </div>
  );
};

export default Office3D;