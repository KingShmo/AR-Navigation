import { useState, useEffect, useRef } from 'react';
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
import Office3D from './Office3D.enhanced';
import { GoogleStyle3DView, EnhancedGoogleStyle3DView } from './GoogleStyle3DView.fixed';
import { jpmcColors, jpmcThemeUI } from './jpmcTheme';
import type { NavigationMode } from './types';
import './App.css';
import TestARView from './TestARView';
import AIAssistant from './AIAssistant';

function App() {
  const [destination, setDestination] = useState('Meeting Room A');
  const [etaSeconds, setEtaSeconds] = useState(222);
  const [navMode, setNavMode] = useState<NavigationMode>('walking');
  const [isARMode, setIsARMode] = useState(false); // Always start with 3D view
  const [loading, setLoading] = useState(true); // Show splash screen during loading
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

  // --- LIVE 3D NAVIGATION STATE ---
  const [liveDistance, setLiveDistance] = useState(Math.floor(etaSeconds / 5));
  const [liveEta, setLiveEta] = useState(etaSeconds);
  const [liveDirection, setLiveDirection] = useState<'left' | 'right' | 'stairs' | 'elevator' | 'forward'>(navMode === 'stairs' ? 'stairs' : navMode === 'elevator' ? 'elevator' : 'forward');
  const [dotPos, setDotPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionCycle = ['forward', 'right', 'forward', 'left'];
  const [cycleIndex, setCycleIndex] = useState(0);

  // Hardcoded direction cycling every 5 seconds
  useEffect(() => {
    if (isARMode) return;
    const dirTimer = setInterval(() => {
      setCycleIndex(prev => (prev + 1) % directionCycle.length);
      setLiveDirection(directionCycle[(cycleIndex + 1) % directionCycle.length] as typeof liveDirection);
    }, 4000);
    return () => clearInterval(dirTimer);
  }, [isARMode, cycleIndex]);

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

  // Simulate dot movement and update banner in 3D view
  useEffect(() => {
    if (isARMode) {
      return () => {}; // Return an empty cleanup function
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Reset dot position to start
    setDotPos({ x: 0, y: 0, z: 0 });
    setLiveEta(etaSeconds);
    setLiveDistance(Math.floor(etaSeconds / 5));
    intervalRef.current = setInterval(() => {
      setDotPos(prev => {
        const dest = destinationMap.find(d => d.name === destination)?.position || { x: 0, y: 0, z: 0 };
        const dx = dest.x - prev.x;
        const dz = dest.z - prev.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.1) return prev; // Arrived
        const step = Math.min(0.08, dist); // Move dot
        const nx = prev.x + (dx / dist) * step;
        const nz = prev.z + (dz / dist) * step;
        return { ...prev, x: nx, z: nz };
      });
      setLiveEta(prev => (prev > 0 ? prev - 1 : 0));
      setLiveDistance(prev => (prev > 0 ? prev - 1 : 0));
      // Direction logic
      setLiveDirection(() => {
        const dest = destinationMap.find(d => d.name === destination)?.position || { x: 0, y: 0, z: 0 };
        const dx = dest.x - dotPos.x;
        const dz = dest.z - dotPos.z;
        if (navMode === 'stairs') return 'stairs';
        if (navMode === 'elevator') return 'elevator';
        if (Math.abs(dx) > Math.abs(dz)) {
          return dx > 0 ? 'right' : 'left';
        } else {
          return dz < 0 ? 'forward' : 'forward';
        }
      });
    }, 1000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isARMode, destination, etaSeconds, navMode]);

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
        console.log("Switching to AR mode, requesting camera access if needed");
        // The actual camera access will be handled by GoogleMapsNavigation component

        // Change mode immediately
        setIsARMode(true);

        // Short delay to allow AR components to initialize
        setTimeout(() => {
          console.log("AR mode ready, hiding loading screen");
          document.body.style.cursor = 'default'; // Restore cursor
          setLoading(false);
        }, 1000); // Shorter delay for better user experience
      } else {
        console.log("Switching back to 3D view mode");

        // Change mode immediately
        setIsARMode(false);

        // Shorter delay for 3D components to initialize and render
        setTimeout(() => {
          console.log("3D view ready, hiding loading screen");
          document.body.style.cursor = 'default'; // Restore cursor
          setLoading(false);
        }, 1000); // Shorter delay for better user experience
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
      
      {/* Hide header in AR mode and on mobile in first person mode for immersion */}
      {!isARMode && !(isMobileDevice && !isARMode) && (
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
              <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: 1 }}>JPMC WayfindAR</h1>
              <p style={{ margin: '4px 0 0', fontWeight: 500, opacity: 0.9 }}>
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
                {isDarkMode ? (
                  <span aria-label="Switch to light mode" role="img">☀️ Light</span>
                ) : (
                  <span aria-label="Switch to dark mode" role="img">🌙 Dark</span>
                )}
              </button>
              
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
                {isARMode ? 'Switch to Office View' : 'Switch to AR View'}
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
        {/* Only show selection controls when not in AR mode */}
        {!isARMode && !(isMobileDevice && !isARMode) && (
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
          height: isMobileDevice && !isARMode ? '100%' : '80vh',
          position: 'relative'
        }}>
          {/* Return to 3D view button that always shows in AR mode */}
          {isARMode && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 2000
            }}>
              <button
                onClick={toggleViewMode}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: jpmcColors.primary,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={jpmcColors.primary}>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Return to 3D View
              </button>
            </div>
          )}

          {/* Toggle between 3D Office View and First Person AR Navigation */}
          {isARMode ? (
            <TestARView
              destination={destination}
              eta={etaSeconds}
              distance={Math.floor(etaSeconds / 5)}
              direction={navMode === 'stairs' ? 'stairs' : navMode === 'elevator' ? 'elevator' : 'forward'}
              navMode={navMode}
              isDarkMode={isDarkMode}
              onToggleViewMode={toggleViewMode}
            />
          ) : (
            <EnhancedGoogleStyle3DView
              destination={destination}
              eta={liveEta}
              distance={liveDistance}
              direction={liveDirection}
              isDarkMode={isDarkMode}
              navMode={navMode}
              onToggleViewMode={toggleViewMode}
              hideCenterDiamond={true}
            >
              <Office3D 
                destination={destination}
                isDarkMode={isDarkMode}
                navMode={navMode}
                // Optionally pass dotPos if Office3D supports it
              />
            </EnhancedGoogleStyle3DView>
          )}
          
          {/* AI Assistant (visible in both modes) */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '350px',
            zIndex: 10000
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(0, 45, 114, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: `1px solid ${isDarkMode ? jpmcColors.accentBlue : jpmcColors.gray}`
            }}>
              <div style={{
                padding: '16px',
                display: 'flex', 
                alignItems: 'center',
                gap: '12px',
                borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : jpmcColors.gray}`
              }}>
                <div style={{
                  backgroundColor: jpmcColors.accentBlue,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  LLM
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '16px',
                    color: isDarkMode ? '#FFFFFF' : jpmcColors.primary
                  }}>NavigAItAR</h3>
                  <p style={{
                    margin: '3px 0 0',
                    fontSize: '14px',
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : jpmcColors.textLight
                  }}>
                    Smart recommendations
                  </p>
                </div>
              </div>
              
              <div style={{ padding: '16px' }}>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <li style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : jpmcColors.backgroundDark,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '22px' }}>🔍</div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      color: isDarkMode ? '#FFFFFF' : jpmcColors.text
                    }}>
                      Based on office occupancy, now is a great time to visit the Innovation Lab
                    </p>
                  </li>
                  <li style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : jpmcColors.backgroundDark,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '22px' }}>🚧</div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      color: isDarkMode ? '#FFFFFF' : jpmcColors.text
                    }}>
                      There's construction on the main hallway. Consider taking the south corridor.
                    </p>
                  </li>
                  <li style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : jpmcColors.backgroundDark,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '22px' }}>♿</div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      color: isDarkMode ? '#FFFFFF' : jpmcColors.text
                    }}>
                      {destination === 'Executive Office'
                        ? 'For wheelchair access to the Executive Office, use the dedicated ramp at the east entrance.'
                        : 'The Innovation Lab has automated doors for easy wheelchair access.'}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Only show About info when not in AR mode */}
        {!isARMode && (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            background: jpmcColors.white,
            borderRadius: !(isMobileDevice && !isARMode) ? jpmcThemeUI.borderRadius.lg : 0,
            boxShadow: !(isMobileDevice && !isARMode) ? jpmcThemeUI.shadows.lg : 'none',
            border: `1px solid ${jpmcColors.gray}`,
            padding: '0 24px',
            fontSize: '1rem',
            color: jpmcColors.secondary,
            margin: 0,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '48px',
            height: 'auto',
            boxSizing: 'border-box',
            overflow: 'visible',
            whiteSpace: 'normal',
            flexWrap: 'nowrap',
            gap: 0,
          }}>
            <h3 style={{
              margin: 0,
              color: jpmcColors.primary,
              fontSize: '1.05rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: '140px',
              borderRight: `1px solid ${jpmcColors.accent}`,
              paddingRight: '18px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}>
              About This Demo
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '32px',
              paddingLeft: '24px',
            }}>
              <span style={{
                fontWeight: 500,
                fontSize: '1rem',
                color: jpmcColors.secondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '320px',
                display: 'inline-block',
              }}>
                Modern AR office using Three.js for 3D rendering.
              </span>
              <span style={{
                fontSize: '1rem',
                color: jpmcColors.primary,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: '120px',
                display: 'inline-block',
                textAlign: 'center',
              }}>
                <strong>Mode:</strong> <span style={{ textTransform: 'capitalize' }}>{navMode}</span>
              </span>
              <span style={{
                fontSize: '0.98rem',
                opacity: 0.85,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '420px',
                display: 'inline-block',
                textAlign: 'right',
              }}>
                {!isARMode ?
                  "View a 3D model with real time navigation updates." :
                  "Use WASD or arrow keys to move and the mouse to look around in first-person AR mode. Navigation banner and arrows update as you move."}
                {isMobileDevice && isARMode && " On mobile, use the virtual joystick and swipe to navigate."}
              </span>
            </div>
          </div>
        )}
      </main>
      
      {/* Only show footer when not in AR mode and not in first-person mode on mobile */}
      {!isARMode && !(isMobileDevice && !isARMode) && (
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
