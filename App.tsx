import { useState, useEffect } from 'react';
import ETADisplay from './ETADisplay';
import LocationSelector from './LocationSelector';
import NavigationSettings from './NavigationSettings';
// Add THREE.js type declaration
declare global {
  interface Window {
    THREE?: any;
  }
}
import * as THREE from 'three';
import NetworkShareInfo from './NetworkShareInfo';
import SplashScreen from './SplashScreen.improved';
import Office3D from './Office3D.enhanced'; // Using fixed version with better error handling
import { GoogleStyle3DView, EnhancedGoogleStyle3DView } from './GoogleStyle3DView.fixed';
import TestARView from './TestARView';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';
import './App.css';

function App() {
  const [destination, setDestination] = useState('Meeting Room A');
  const [etaSeconds, setEtaSeconds] = useState(222);
  const [navMode, setNavMode] = useState<NavigationMode>('walking');
  const [isARMode, setIsARMode] = useState(false); // Always start with 3D view
  const [loading, setLoading] = useState(true); // Show splash screen during loading
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [useEnhanced3D, setUseEnhanced3D] = useState(true); // Toggle for enhanced 3D view
  
  // Define 3D positions for each destination
  const destinationMap = [
    { name: "Meeting Room A", position: { x: -5, y: 0, z: -7 }, etaSeconds: 222 },
    { name: "Executive Office", position: { x: 7, y: 0, z: 7 }, etaSeconds: 305 },
    { name: "Cafeteria", position: { x: 7, y: 0, z: -8 }, etaSeconds: 178 },
    { name: "Innovation Lab", position: { x: -2, y: 0, z: -4 }, etaSeconds: 254 },
    { name: "Starbucks", position: { x: -7, y: 0, z: 7 }, etaSeconds: 254 }
  ];

  const handleDestinationChange = (location: string, seconds: number) => {
    setDestination(location);
    
    // Adjust ETA based on navigation mode
    let multiplier = 1;
    switch (navMode) {
      case 'wheelchair': multiplier = 1.2; break;
      case 'stairs': multiplier = 0.9; break;
      case 'elevator': multiplier = 1.5; break;
      default: multiplier = 1;
    }
    
    setEtaSeconds(Math.round(seconds * multiplier));
  };

  const handleModeChange = (mode: NavigationMode) => {
    setNavMode(mode);
    
    // Adjust ETA based on navigation mode (simple multiplier for demo)
    let multiplier = 1;
    switch (mode) {
      case 'wheelchair': multiplier = 1.2; break;
      case 'stairs': multiplier = 0.9; break;
      case 'elevator': multiplier = 1.5; break;
      default: multiplier = 1;
    }
    
    // Find base ETA for current destination
    const baseEta = destinationMap.find(d => d.name === destination)?.etaSeconds || 222;
    setEtaSeconds(Math.round(baseEta * multiplier));
  };

  // Detect if user is on mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
      
      // Show network info button on desktop, not on mobile
      setShowNetworkInfo(!isMobile);
      
      // Set appropriate mode based on device
      if (isMobile) {
        // Set dark mode to false for Google Maps style light theme
        setIsDarkMode(false);
      }
    };
    
    checkMobile();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Toggle between AR and first person view
  const toggleViewMode = () => {
    // Force showing loading screen during the transition
    console.log("Beginning mode toggle, forcing loading screen");
    document.body.style.cursor = 'wait'; // Change cursor to indicate loading
    setLoading(true);
    
    // Make sure loading state is set to true immediately
    setTimeout(() => {
      console.log(`Current mode: ${isARMode ? 'AR' : '3D View'}, switching to ${!isARMode ? 'AR' : '3D View'}`);
      
      // First, destroy any existing THREE.js contexts to avoid conflicts
      if (window.THREE) {
        console.log("Cleaning up any existing THREE.js contexts before mode switch");
      }
      
      // If switching to AR mode, prepare for camera access
      if (!isARMode) {
        console.log("Switching to TestARView with camera access");
        // The actual camera access will be handled by TestARView component
        
        // Change mode immediately
        setIsARMode(true);
        
        // Short delay to allow AR components to initialize
        setTimeout(() => {
          console.log("AR mode ready, hiding loading screen");
          document.body.style.cursor = 'default'; // Restore cursor
          setLoading(false);
        }, 800); // Shorter delay for better user experience
      } else {
        console.log("Switching back to 3D view mode");
        
        // Change mode immediately
        setIsARMode(false);
        
        // Shorter delay for 3D components to initialize and render
        setTimeout(() => {
          console.log("3D view ready, hiding loading screen");
          document.body.style.cursor = 'default'; // Restore cursor
          setLoading(false);
        }, 800); // Shorter delay for better user experience
      }
    }, 100); // Shorter delay to ensure the loading screen shows up faster
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Set loading to false after a timeout to ensure app loads properly
  useEffect(() => {
    console.log("App initialized, showing splash screen");
    
    // CRITICAL: Make sure loading is true on initial load
    setLoading(true);
    
    // CRITICAL: Force non-AR mode during initialization
    // This is critical to prevent camera access requests during startup
    setIsARMode(false);
    
    // This is important - reset any stale camera or WebGL contexts
    if (window.THREE) {
      console.log("Cleaning up any existing THREE.js contexts");
    }
    
    // Pre-load Three.js resources
    const preloadThree = () => {
      console.log("Pre-loading 3D components...");
      try {
        // Create temporary Three.js objects to trigger resource loading
        const tempScene = new THREE.Scene();
        const tempCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const tempRenderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: false // Ensure no transparency during preload
        });
        
        // Dispose immediately
        tempRenderer.dispose();
        tempScene.clear();
        
        // Use tempCamera in a trivial way to avoid unused variable warning
        if (tempCamera.position) {
          tempCamera.position.set(0, 0, 0);
        }
        
        console.log("Three.js preloading successful");
      } catch (err) {
        console.error("Error during Three.js preloading:", err);
      }
    };
    
    // Ensure we're in 3D mode before anything else happens
    setTimeout(() => {
      console.log("Ensuring app starts in 3D mode...");
      setIsARMode(false);
      
      // Try to preload Three.js after ensuring 3D mode
      setTimeout(preloadThree, 500);
    }, 100);
    
    // Simulating loading assets with a longer timeout to ensure 3D content is loaded
    const timer = setTimeout(() => {
      console.log("Initial loading complete, hiding splash screen");
      // Double-check we're still in 3D mode before releasing splash screen
      setIsARMode(false);
      
      // IMPORTANT: Add a flag to local storage to indicate we're done with initial loading
      localStorage.setItem('initialLoadComplete', 'true');
      
      // Hide loading screen to show 3D view
      setLoading(false);
    }, 3000); // Shorter loading time to show 3D content faster
    
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen if loading - force display with a dedicated wrapper
  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 9999,
        backgroundColor: isDarkMode ? jpmcColors.dark : jpmcColors.background
      }}>
        <SplashScreen 
          onComplete={() => {
            console.log("SplashScreen onComplete called");
            setLoading(false);
          }} 
          isDarkMode={isDarkMode} 
        />
      </div>
    );
  }

  return (
    <div style={{ 
      background: isDarkMode ? jpmcColors.dark : jpmcColors.background, 
      minHeight: '100vh', 
      padding: 0,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      color: isDarkMode ? jpmcColors.white : jpmcColors.text
    }}>
      {/* Network Sharing Information - only show button on desktop */}
      {showNetworkInfo && <NetworkShareInfo />}
      
      {/* Hide header on mobile in first person mode for immersion */}
      {!(isMobileDevice && !isARMode) && (
        <header style={{ 
          background: `linear-gradient(to right, ${jpmcColors.primary}, ${jpmcColors.secondary})`, 
          color: jpmcColors.white, 
          padding: '1.25rem 0', 
          marginBottom: 24,
          boxShadow: jpmcThemeUI.shadows.md
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: 1 }}>JPMC NavigatAR</h1>
              <p style={{ margin: '4px 0 0', fontWeight: 500, opacity: 1 }}>
                Interactive Office Wayfinding
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={toggleDarkMode}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : jpmcColors.white,
                  color: isDarkMode ? jpmcColors.white : jpmcColors.secondary,
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: jpmcThemeUI.borderRadius.md,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: jpmcThemeUI.shadows.sm,
                  transition: jpmcThemeUI.transitions.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              {!isARMode && (
                <button 
                  onClick={() => setUseEnhanced3D(!useEnhanced3D)}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : jpmcColors.white,
                    color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: jpmcThemeUI.borderRadius.md,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: jpmcThemeUI.shadows.sm,
                    transition: jpmcThemeUI.transitions.medium
                  }}
                >
                  {useEnhanced3D ? 'Standard View' : 'Enhanced 3D'}
                </button>
              )}
              
              <button 
                onClick={toggleViewMode}
                style={{
                  backgroundColor: isDarkMode ? jpmcColors.primary : jpmcColors.white,
                  color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: jpmcThemeUI.borderRadius.md,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: jpmcThemeUI.shadows.sm,
                  transition: jpmcThemeUI.transitions.medium
                }}
              >
                {isARMode ? 'Switch to 3D View' : 'Switch to First Person AR'}
              </button>
            </div>
          </div>
        </header>
      )}
      
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        padding: isMobileDevice && !isARMode ? 0 : '0 20px 40px',
        height: isMobileDevice && !isARMode ? '100vh' : 'auto',
      }}>
        {/* Only show selection controls when not in first-person mode on mobile */}
        {!(isMobileDevice && !isARMode) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
              <LocationSelector 
                onDestinationChange={handleDestinationChange} 
                currentLocation={destination} 
              />
            </div>
            <div style={{ flex: '1 1 30%', minWidth: '250px' }}>
              <NavigationSettings
                onModeChange={handleModeChange}
                currentMode={navMode}
              />
            </div>
          </div>
        )}
        
        <div style={{
          background: jpmcColors.white,
          borderRadius: !(isMobileDevice && !isARMode) ? jpmcThemeUI.borderRadius.lg : 0,
          boxShadow: !(isMobileDevice && !isARMode) ? jpmcThemeUI.shadows.lg : 'none',
          overflow: 'hidden',
          marginBottom: !(isMobileDevice && !isARMode) ? '24px' : 0,
          height: '80vh', // Fixed height for all modes for better user experience
        }}>
          {/* Toggle between 3D Office View and First Person AR Navigation */}
          {isARMode ? (
            <TestARView
              destination={destination}
              eta={etaSeconds}
              distance={Math.floor(etaSeconds / 5)}
              direction={navMode === 'stairs' ? 'stairs' : navMode === 'elevator' ? 'elevator' : 'forward'}
              onToggleViewMode={toggleViewMode}
            />
          ) : (
            useEnhanced3D ? (
              <EnhancedGoogleStyle3DView
                destination={destination}
                eta={etaSeconds}
                distance={Math.floor(etaSeconds / 5)} // Rough approximation of distance in feet
                direction={navMode === 'stairs' ? 'stairs' : navMode === 'elevator' ? 'elevator' : 'forward'}
                isDarkMode={isDarkMode}
                onToggleViewMode={toggleViewMode}
              >
                <Office3D 
                  destination={destination}
                  isDarkMode={isDarkMode}
                  navMode={navMode}
                />
              </EnhancedGoogleStyle3DView>
            ) : (
              <GoogleStyle3DView
                destination={destination}
                eta={etaSeconds}
                distance={Math.floor(etaSeconds / 5)} // Rough approximation of distance in feet
                direction={navMode === 'stairs' ? 'stairs' : navMode === 'elevator' ? 'elevator' : 'forward'}
                isDarkMode={isDarkMode}
                onToggleViewMode={toggleViewMode}
              >
                <Office3D 
                  destination={destination}
                  isDarkMode={isDarkMode}
                  navMode={navMode}
                />
              </GoogleStyle3DView>
            )
          )}
        </div>
        
        {/* Only show ETA display and about info when not in first-person mode on mobile */}
        {!(isMobileDevice && !isARMode) && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{
              flex: '1 1 60%',
              minWidth: '300px',
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
      </main>
      
      {/* Only show footer when not in first-person mode on mobile */}
      {!(isMobileDevice && !isARMode) && (
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: `1px solid ${jpmcColors.gray}`,
          color: jpmcColors.secondary,
          fontSize: '0.9rem',
          background: jpmcColors.backgroundDark
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <p style={{ margin: '0 0 8px' }}>
              JPMorgan Chase AR Navigation Demo &copy; {new Date().getFullYear()}
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px',
              fontSize: '0.8rem'
            }}>
              <a href="#" style={{ color: jpmcColors.primary, textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: jpmcColors.primary, textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: jpmcColors.primary, textDecoration: 'none' }}>Support</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
