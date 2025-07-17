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
  const [etaSeconds, setEtaSeconds] = useState(180);
  const [distanceFeet, setDistanceFeet] = useState(60);

  // Reference to the animation frame for cleanup
  const animationFrameRef = useRef<number | null>(null);

  // On component mount
  useEffect(() => {
    console.log("Simple Office3D component mounting for destination:", destination);
    
    const mount = mountRef.current;
    if (!mount) {
      console.error("Mount ref is not available");
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? jpmcColors.dark : jpmcColors.background);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 1, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? '#1c2c4a' : jpmcColors.gray,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Simple person representation
    const personGroup = new THREE.Group();
    
    // Head (blue sphere)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16), 
      new THREE.MeshStandardMaterial({ color: jpmcColors.primary })
    );
    head.position.y = 1.6;
    
    // Body (blue cylinder)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 0.8, 16), 
      new THREE.MeshStandardMaterial({ color: jpmcColors.primary })
    );
    body.position.y = 1.1;
    
    personGroup.add(head, body);
    scene.add(personGroup);
    
    // Simple animation
    const animate = () => {
      personGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
      // Set a timer to hide loading indicator quickly - we want the 3D view to be visible 
    // as soon as possible after the splash screen disappears
    const loadingTimer = setTimeout(() => {
      console.log("3D office rendering complete, removing loading indicator");
      setIsLoading(false);
    }, 800);
    
    // Force render a frame to ensure visibility
    renderer.render(scene, camera);
    
    // Handle window resizing
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      console.log("Office3D component unmounting");
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      
      clearTimeout(loadingTimer);
    };
  }, [destination, isDarkMode, navMode]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDarkMode ? jpmcColors.backgroundDark : jpmcColors.background,
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
          borderRadius: '8px'
        }}>
          Loading 3D Office...
        </div>
      )}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.background
        }} 
      >
      {/* This extra div ensures content is visible even if Three.js doesn't render */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          fontSize: '14px',
          color: isDarkMode ? jpmcColors.accent : jpmcColors.secondary,
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          Loading 3D Office...
        </div>
      )}
      </div>
      {/* Only show ETA display and about info when not in AR mode and not on mobile */}
      {!isARMode && !isMobileDevice && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{
            flex: '1 1 60%',
            minWidth: '300px'
          }}>
            <div style={{
              background: jpmcColors.white,
              borderRadius: jpmcThemeUI.borderRadius.lg,
              padding: '24px',
              boxShadow: jpmcThemeUI.shadows.md
            }}>
              <ETADisplay 
                destinationName={destination}
                initialSeconds={etaSeconds}
              />
            </div>
          </div>
          
          <div style={{ 
            flex: '1 1 30%',
            minWidth: '250px',
            padding: '24px',
            backgroundColor: jpmcColors.white, 
            borderRadius: jpmcThemeUI.borderRadius.lg,
            boxShadow: jpmcThemeUI.shadows.md,
            fontSize: '0.95rem',
            color: jpmcColors.secondary
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: jpmcColors.primary, 
              fontSize: '1.25rem',
              borderBottom: `2px solid ${jpmcColors.accent}`,
              paddingBottom: '8px'
            }}>
              About This Demo
            </h3>
            <p style={{ margin: '0 0 12px' }}>
              This interactive AR office navigation demonstrates a modern approach to indoor wayfinding 
              using Three.js for 3D rendering.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              <strong>Current Mode:</strong> <span style={{ 
                textTransform: 'capitalize', 
                color: jpmcColors.primary,
                fontWeight: 500
              }}>{navMode}</span>
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              {!isARMode ? 
                "View a 3D model of the office with animated navigation paths." :
                "Use WASD or arrow keys to move and the mouse to look around in first-person AR mode."}
              {isMobileDevice && isARMode && " On mobile, use the virtual joystick and swipe to navigate."}
            </p>
          </div>
        </div>
      )}
      {/* On mobile, show AI recs block under the office view instead of ETA */}
      {!isARMode && isMobileDevice && (
        <div style={{
          margin: '24px 0',
          padding: 0
        }}>
          <AIAssistant
            destination={destination}
            navMode={navMode}
            etaSeconds={etaSeconds}
            isDarkMode={isDarkMode}
            isARMode={false}
          />
        </div>
      )}
    </div>
  );
}

export default Office3D;
