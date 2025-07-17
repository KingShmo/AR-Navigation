import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { jpmcColors } from './jpmcTheme';
import Enhanced3DPerson from './Enhanced3DPerson';
import { GoogleStyle3DView, EnhancedGoogleStyle3DView } from './GoogleStyle3DView.fixed';
import './App.css';

interface Office3DProps {
  destination?: string;
  isDarkMode?: boolean;
  navMode?: 'walking' | 'wheelchair' | 'stairs' | 'elevator';
  onNavigationUpdate?: (nav: { eta: number, feet: number, direction: string }) => void;
}

function Office3D({ destination = 'Innovation Lab', isDarkMode = false, navMode = 'walking', onNavigationUpdate }: Office3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'left' | 'right' | 'stairs' | 'elevator'>('forward');
  const [etaSeconds, setEtaSeconds] = useState(180);
  const [distanceFeet, setDistanceFeet] = useState(60);
  const [personPosition, setPersonPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [personRotation, setPersonRotation] = useState<[number, number, number]>([0, 0, 0]);

  // Reference to person group for external access
  const personGroupRef = useRef<THREE.Group | null>(null);
  
  // Reference to the animation frame for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Consistent person type for the session
  const personTypeRef = useRef<'male' | 'female' | 'diverse'>(
    Math.random() > 0.6 ? 'male' : Math.random() > 0.5 ? 'female' : 'diverse'
  );
  // Update office colors with JPMC-friendly palette - always light colors regardless of dark mode
  const OFFICE_COLORS = {
    wall: '#FFFFFF', // white walls
    floor: '#B3D8F7', // baby blue floor
    desk: '#D2B48C', // light wood
    chair: '#3A6EA5', // blue chairs
    plant: '#4CAF50', // green plants
    accent: '#F7C873', // soft yellow accent
    art: '#E57373', // coral art pieces
    glass: 'rgba(180,220,255,0.3)', // glass partitions
    carpet: '#1F4068', // dark blue carpet for meeting rooms
    wood: '#8B4513', // dark wood trim
    metal: '#A9A9A9', // metal fixtures
    executive: '#2E5090', // executive office accent
    secondaryWall: '#F5F5F5', // slightly off-white for secondary walls
  };

  // Make the office much larger with expansive layout
  const OFFICE_WIDTH = 50; // Increased from 20
  const OFFICE_DEPTH = 50; // Increased from 20
  const WALL_HEIGHT = 3.5;
  
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    console.log("Enhanced Office3D component mounting for destination:", destination);
    setMounted(true);    // Scene setup with enhanced visuals
    const scene = new THREE.Scene();
    // Always keep the background light regardless of dark mode
    scene.background = new THREE.Color(jpmcColors.background);

    // Camera with better positioning for a more dynamic view
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 12); // Higher and further back for better overview of larger office
    camera.lookAt(0, 1, 0);

    // Enhanced renderer with better shadow quality
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 1.2; // Always keep bright exposure regardless of dark mode
    mount.appendChild(renderer.domElement);

    // Add OrbitControls for panning/looking around
    let controls: any;
    import('three-stdlib').then(({ OrbitControls }) => {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.minDistance = 2;
      controls.maxDistance = 50;
      controls.minPolarAngle = Math.PI / 6; // Prevent seeing under the floor
      controls.maxPolarAngle = Math.PI / 2; // Limit to horizontal view
      controls.target.set(0, 1, 0);
    });    // Enhanced lighting system - always keep light colors for the office environment
    const ambientLight = new THREE.AmbientLight(
      jpmcColors.white, 
      0.8 // Increased brightness for better visibility regardless of dark mode
    );
    scene.add(ambientLight);
      // Main directional light - always keep light colors for the office environment
    const dirLight = new THREE.DirectionalLight(
      jpmcColors.white, 
      1.0 // Increased brightness for better visibility regardless of dark mode
    );
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;  // Enhanced shadow resolution
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.bias = -0.0005;  // Reduce shadow acne
    scene.add(dirLight);
      // Add accent lighting for visual interest - keep consistent light colors
    const accentLight1 = new THREE.PointLight(
      jpmcColors.accentYellow,
      0.3,
      20
    );
    accentLight1.position.set(-8, 5, -8);
    scene.add(accentLight1);
      const accentLight2 = new THREE.PointLight(
      jpmcColors.accentGreen,
      0.2,
      15
    );
    accentLight2.position.set(8, 4, 8);
    scene.add(accentLight2);    // Enhanced floor with better texture and reflection - always keep light colors
    const floorGeometry = new THREE.PlaneGeometry(OFFICE_WIDTH, OFFICE_DEPTH, 40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: jpmcColors.gray,
      roughness: 0.8,
      metalness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // Add bottom floor to prevent seeing underneath - always keep light colors
    const bottomFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(OFFICE_WIDTH + 30, OFFICE_DEPTH + 30),
      new THREE.MeshStandardMaterial({ 
        color: '#e0e0e0',
        side: THREE.DoubleSide
      })
    );
    bottomFloor.rotation.x = Math.PI / 2;
    bottomFloor.position.y = -0.1;
    scene.add(bottomFloor);    // Office Walls with enhanced materials - always keep light colors
    const createWall = (
      width: number, 
      height: number, 
      depth: number, 
      x: number, 
      y: number, 
      z: number,
      color: string = '#f0f0f0'
    ) => {
      const wallGeometry = new THREE.BoxGeometry(width, height, depth);
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.9,
        metalness: 0.1,
        emissive: undefined,
        emissiveIntensity: 0
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
      return wall;
    };

    // Create office boundaries with accent colors
    createWall(20, 4, 0.2, 0, 2, -10); // Back wall
    createWall(0.2, 4, 20, -10, 2, 0); // Left wall
    createWall(0.2, 4, 20, 10, 2, 0);  // Right wall

    // Meeting room (destination) with enhanced visuals
    const meetingRoom = new THREE.Group();
    
    // Meeting room walls with JPMC branding elements
    const roomWall1 = createWall(6, 3, 0.2, -4, 1.5, -5);
    const roomWall2 = createWall(0.2, 3, 4, -7, 1.5, -7);
    const roomWall3 = createWall(6, 3, 0.2, -4, 1.5, -9);
    
    // Accent strip on meeting room wall with JPMC branding
    const accentStripGeometry = new THREE.BoxGeometry(6, 0.2, 0.05);
    const accentStripMaterial = new THREE.MeshStandardMaterial({ 
      color: jpmcColors.accentBlue,
      roughness: 0.3,
      metalness: 0.5,
      emissive: jpmcColors.accentBlue,
      emissiveIntensity: isDarkMode ? 0.5 : 0.2
    });
    const accentStrip = new THREE.Mesh(accentStripGeometry, accentStripMaterial);
    accentStrip.position.set(-4, 2.5, -4.92);
    meetingRoom.add(accentStrip);
    
    // Enhanced meeting room table with realistic materials
    const tableGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: '#8B4513', 
      roughness: 0.5,
      metalness: 0.2,
      emissive: isDarkMode ? '#3a1c06' : undefined,
      emissiveIntensity: isDarkMode ? 0.2 : 0
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(-4, 1, -7);
    table.castShadow = true;
    table.receiveShadow = true;
    
    // Table decoration
    const tableCenterpiece = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.4),
      new THREE.MeshStandardMaterial({ 
        color: jpmcColors.accentOrange,
        metalness: 0.4,
        roughness: 0.4 
      })
    );
    tableCenterpiece.position.set(-4, 1.08, -7);
    tableCenterpiece.castShadow = true;
    meetingRoom.add(tableCenterpiece);
    
    // Meeting room sign with better typography
    const signGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({ 
      color: jpmcColors.primary,
      roughness: 0.3,
      metalness: 0.6,
      emissive: jpmcColors.primary,
      emissiveIntensity: isDarkMode ? 0.5 : 0.2
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-4, 2.8, -4.9);
    
    meetingRoom.add(roomWall1, roomWall2, roomWall3, table, sign);
    scene.add(meetingRoom);

    // Add additional meeting rooms
    const createMeetingRoom = (x: number, z: number, rotation: number = 0) => {
      const room = new THREE.Group();
      
      // Room walls
      const wall1 = createWall(4, 3, 0.2, x, 1.5, z);
      const wall2 = createWall(0.2, 3, 3, x - 2, 1.5, z + 1.5);
      const wall3 = createWall(4, 3, 0.2, x, 1.5, z + 3);
      
      // Room table
      const roomTable = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 1.5),
        new THREE.MeshStandardMaterial({ 
          color: '#8B4513',
          roughness: 0.5,
          metalness: 0.2
        })
      );
      roomTable.position.set(x, 1, z + 1.5);
      
      // Room sign
      const roomSign = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.4, 0.05),
        new THREE.MeshStandardMaterial({ 
          color: jpmcColors.primary,
          emissive: jpmcColors.primary,
          emissiveIntensity: isDarkMode ? 0.5 : 0.2
        })
      );
      roomSign.position.set(x, 2.5, z - 0.05);
      
      room.add(wall1, wall2, wall3, roomTable, roomSign);
      room.rotation.y = rotation;
      scene.add(room);
      
      // Add accent lighting
      const roomLight = new THREE.PointLight(
        isDarkMode ? '#4a89ca' : '#ffffff',
        isDarkMode ? 0.7 : 0.4,
        6
      );
      roomLight.position.set(x, 2.2, z + 1.5);
      scene.add(roomLight);
    };

    // Add multiple meeting rooms
    createMeetingRoom(7, -7);
    createMeetingRoom(7, -3);
    createMeetingRoom(-7, -7, Math.PI);
    
    // Add executive offices
    const createExecutiveOffice = (x: number, z: number, rotation: number = 0) => {
      const office = new THREE.Group();
      
      // Office walls
      const wall1 = createWall(5, 3.5, 0.2, x, 1.75, z);
      const wall2 = createWall(0.2, 3.5, 4, x - 2.5, 1.75, z + 2);
      const wall3 = createWall(5, 3.5, 0.2, x, 1.75, z + 4);
      
      // Luxury desk
      const execDesk = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 1.2),
        new THREE.MeshStandardMaterial({ 
          color: '#453024',
          roughness: 0.3,
          metalness: 0.5
        })
      );
      execDesk.position.set(x, 1, z + 2);
      
      // Name plate
      const namePlate = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.3, 0.05),
        new THREE.MeshStandardMaterial({ 
          color: jpmcColors.accentYellow,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      namePlate.position.set(x, 2.8, z - 0.05);
      
      office.add(wall1, wall2, wall3, execDesk, namePlate);
      office.rotation.y = rotation;
      scene.add(office);
      
      // Add premium lighting
      const officeLight = new THREE.SpotLight(
        isDarkMode ? '#6a8ad2' : '#ffffff',
        isDarkMode ? 0.8 : 0.6,
        8,
        Math.PI / 4
      );
      officeLight.position.set(x, 3, z + 2);
      officeLight.target.position.set(x, 0, z + 2);
      scene.add(officeLight);
      scene.add(officeLight.target);
    };

    // Add executive offices
    createExecutiveOffice(-7, 4);
    createExecutiveOffice(-7, -2);
    createExecutiveOffice(7, 4, Math.PI);

    // Add desk clusters in an organized layout
    // Main open office area
    const addDesk = (x: number, z: number) => {
      const deskGroup = new THREE.Group();
      
      // Enhanced desk with better materials
      const deskGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.8);
      const deskMaterial = new THREE.MeshStandardMaterial({ 
        color: '#D2B48C', 
        roughness: 0.6,
        metalness: 0.1,
        emissive: isDarkMode ? '#3a3228' : undefined,
        emissiveIntensity: isDarkMode ? 0.2 : 0
      });
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.position.y = 0.5;
      desk.castShadow = true;
      desk.receiveShadow = true;
      
      // Computer monitor with screen glow in dark mode
      const monitorStandGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
      const monitorStandMaterial = new THREE.MeshStandardMaterial({ color: '#555' });
      const monitorStand = new THREE.Mesh(monitorStandGeometry, monitorStandMaterial);
      monitorStand.position.y = 0.675;
      
      const monitorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.03);
      const monitorMaterial = new THREE.MeshStandardMaterial({ 
        color: '#111',
        emissive: isDarkMode ? jpmcColors.accentBlue : undefined,
        emissiveIntensity: isDarkMode ? 0.7 : 0
      });
      const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
      monitor.position.y = 0.8;
      
      // Add a screen texture to the monitor
      const screenGeometry = new THREE.PlaneGeometry(0.48, 0.28);
      const screenMaterial = new THREE.MeshStandardMaterial({ 
        color: isDarkMode ? '#1e3756' : '#ffffff',
        emissive: isDarkMode ? '#3a6ea5' : undefined,
        emissiveIntensity: isDarkMode ? 0.5 : 0
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(0, 0.8, 0.018);
      
      // Add JPMC logo to some screens
      if (Math.random() > 0.5) {
        const logoGeometry = new THREE.PlaneGeometry(0.2, 0.1);
        const logoMaterial = new THREE.MeshBasicMaterial({ 
          color: jpmcColors.primary,
          transparent: true,
          opacity: 0.9
        });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(0, 0, 0.001);
        screen.add(logo);
      }
      
      // Enhanced chair with better ergonomics
      const chairSeatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
      const chairMaterial = new THREE.MeshStandardMaterial({ 
        color: '#333',
        roughness: 0.7
      });
      const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
      chairSeat.position.set(0, 0.3, 0.5);
      
      const chairBackGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
      const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
      chairBack.position.set(0, 0.55, 0.75);

      // Add some items to the desk (coffee cup, notebook, etc.)
      if (Math.random() > 0.5) {
        const coffeeGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.1, 16);
        const coffeeMaterial = new THREE.MeshStandardMaterial({ 
          color: jpmcColors.accentOrange, 
          roughness: 0.2,
          metalness: 0.8
        });
        const coffeeCup = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
        coffeeCup.position.set(0.4, 0.55, 0);
        deskGroup.add(coffeeCup);
      }
      
      if (Math.random() > 0.6) {
        const notebookGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.3);
        const notebookMaterial = new THREE.MeshStandardMaterial({ color: '#efefef' });
        const notebook = new THREE.Mesh(notebookGeometry, notebookMaterial);
        notebook.position.set(-0.4, 0.53, 0);
        notebook.rotation.z = 0.1;
        deskGroup.add(notebook);
      }
      
      deskGroup.add(desk, monitorStand, monitor, screen, chairSeat, chairBack);
      deskGroup.position.set(x, 0, z);
      scene.add(deskGroup);
    };
    for (let x = 2; x <= 8; x += 2) {
      for (let z = -3; z <= 3; z += 2) {
        addDesk(x, z);
      }
    }
    
    // Collaborative workspace area
    for (let x = -8; x <= -6; x += 2) {
      for (let z = 2; z <= 6; z += 2) {
        addDesk(x, z);
      }
    }
    
    // Developer pod area
    for (let x = 2; x <= 6; x += 2) {
      for (let z = -8; z <= -6; z += 2) {
        addDesk(x, z);
      }
    }

    // Add potted plants for office greenery
    const addPlant = (x: number, z: number) => {
      const plantGroup = new THREE.Group();
      
      // Pot
      const potGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 16);
      const potMaterial = new THREE.MeshStandardMaterial({ 
        color: '#7D5A4F',
        roughness: 0.8
      });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.position.y = 0.15;
      pot.castShadow = true;
      pot.receiveShadow = true;
      
      // Plant
      const plantGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const plantMaterial = new THREE.MeshStandardMaterial({ 
        color: jpmcColors.accentGreen,
        roughness: 0.9 
      });
      const plantTop = new THREE.Mesh(plantGeometry, plantMaterial);
      plantTop.position.y = 0.35;
      plantTop.scale.set(1, 1.2, 1);
      
      plantGroup.add(pot, plantTop);
      plantGroup.position.set(x, 0, z);
      scene.add(plantGroup);
    };
      // Add plants throughout the office for a more vibrant environment
    // Main walkway plants
    addPlant(-7, -3);
    addPlant(-7, 0);
    addPlant(-7, 3);
    addPlant(8, -3);
    addPlant(8, 0);
    addPlant(8, 3);
    
    // Corner plants
    addPlant(-9, -9);
    addPlant(-9, 9);
    addPlant(9, -9);
    addPlant(9, 9);
    
    // Meeting room entrance plants
    addPlant(5, -7);
    addPlant(5, -3);
    addPlant(-5, -7);
    
    // Executive office plants
    addPlant(-9, 4);
    addPlant(-9, -2);
    addPlant(9, 4);

    // Add a water cooler
    const waterCooler = new THREE.Group();
    
    // Base
    const coolerBaseGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
    const coolerBaseMaterial = new THREE.MeshStandardMaterial({ color: '#333' });
    const coolerBase = new THREE.Mesh(coolerBaseGeometry, coolerBaseMaterial);
    coolerBase.position.y = 0.05;
    
    // Stand
    const coolerStandGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
    const coolerStandMaterial = new THREE.MeshStandardMaterial({ color: '#444' });
    const coolerStand = new THREE.Mesh(coolerStandGeometry, coolerStandMaterial);
    coolerStand.position.y = 0.5;
    
    // Water tank
    const coolerTankGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
    const coolerTankMaterial = new THREE.MeshStandardMaterial({ 
      color: '#ADE8F4',
      transparent: true,
      opacity: 0.7
    });
    const coolerTank = new THREE.Mesh(coolerTankGeometry, coolerTankMaterial);
    coolerTank.position.y = 1.2;
    
    waterCooler.add(coolerBase, coolerStand, coolerTank);
    waterCooler.position.set(8, 0, -1);
    scene.add(waterCooler);

    // Add Starbucks area
    const createStarbucks = (x: number, z: number) => {
      const group = new THREE.Group();
      // Counter
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 0.7),
        new THREE.MeshStandardMaterial({
          color: '#6C4F3D', // coffee brown
          roughness: 0.5,
          metalness: 0.3
        })
      );
      counter.position.set(x, 0.25, z);
      group.add(counter);
      // Starbucks sign
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.3, 0.05),
        new THREE.MeshStandardMaterial({
          color: '#00704A', // Starbucks green
          emissive: '#00704A',
          emissiveIntensity: 0.7
        })
      );
      sign.position.set(x, 1.1, z - 0.4);
      group.add(sign);
      // Coffee machine
      const machine = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.3),
        new THREE.MeshStandardMaterial({
          color: '#222',
          metalness: 0.7,
          roughness: 0.3
        })
      );
      machine.position.set(x + 0.7, 0.45, z);
      group.add(machine);
      // Add some cups
      for (let i = 0; i < 3; i++) {
        const cup = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16),
          new THREE.MeshStandardMaterial({ color: '#fff' })
        );
        cup.position.set(x - 0.7 + i * 0.3, 0.56, z + 0.2);
        group.add(cup);
      }
      scene.add(group);
    };
    createStarbucks(-7, 7);

    // Add Cafeteria area
    const createCafeteria = (x: number, z: number) => {
      const group = new THREE.Group();
      // Counter
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.5, 0.7),
        new THREE.MeshStandardMaterial({
          color: '#FFD100', // JPMC yellow
          roughness: 0.4,
          metalness: 0.2
        })
      );
      counter.position.set(x, 0.25, z);
      group.add(counter);
      // Cafeteria sign
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 0.05),
        new THREE.MeshStandardMaterial({
          color: '#FF9E1B', // JPMC orange
          emissive: '#FF9E1B',
          emissiveIntensity: 0.7
        })
      );
      sign.position.set(x, 1.1, z - 0.4);
      group.add(sign);
      // Food trays
      for (let i = 0; i < 4; i++) {
        const tray = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.05, 0.15),
          new THREE.MeshStandardMaterial({ color: '#eee' })
        );
        tray.position.set(x - 0.9 + i * 0.6, 0.53, z + 0.2);
        group.add(tray);
      }
      scene.add(group);
    };
    createCafeteria(7, -8);

    // Add printers
    const createPrinter = (x: number, z: number) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.4, 0.4),
        new THREE.MeshStandardMaterial({
          color: '#E1E5EA',
          metalness: 0.2,
          roughness: 0.7
        })
      );
      body.position.set(x, 0.2, z);
      group.add(body);
      // Paper tray
      const tray = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.2),
        new THREE.MeshStandardMaterial({ color: '#fff' })
      );
      tray.position.set(x, 0.05, z + 0.15);
      group.add(tray);
      // Control panel
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.05, 0.05),
        new THREE.MeshStandardMaterial({ color: '#00A9E0' })
      );
      panel.position.set(x + 0.15, 0.35, z - 0.15);
      group.add(panel);
      scene.add(group);
    };
    createPrinter(2, 6);
    createPrinter(-2, -6);

    // --- Improved shading: add soft ambient occlusion and more realistic materials ---
    const aoLight = new THREE.AmbientLight('#888', 0.15);
    scene.add(aoLight);

    // Create 3D person placeholder for position tracking
    const personGroup = new THREE.Group();
    personGroupRef.current = personGroup;
    
    // Create a simple placeholder mesh to help with positioning
    const personPlaceholderGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const personPlaceholderMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const personPlaceholder = new THREE.Mesh(personPlaceholderGeometry, personPlaceholderMaterial);
    personGroup.add(personPlaceholder);
    scene.add(personGroup);
    
    // Navigation path with enhanced visibility
    // Determine path points based on destination
    let pathPoints: THREE.Vector3[] = [];
    let destinationPoint: THREE.Vector3;
    
    switch(destination) {
      case 'Meeting Room':
      case 'Meeting Room A':
        destinationPoint = new THREE.Vector3(-4, 0.05, -7);        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),         // Start
          new THREE.Vector3(3, 0.05, 0),         // Turn point
          new THREE.Vector3(3, 0.05, -4),        // Second turn
          new THREE.Vector3(-2, 0.05, -4),       // Approaching meeting room
          destinationPoint                       // Meeting room
        ];
        break;
      case 'Executive Office':
        destinationPoint = new THREE.Vector3(7, 0.05, 7);        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),        // Start
          new THREE.Vector3(3, 0.05, 0),        // First turn
          new THREE.Vector3(3, 0.05, 3),        // Second turn
          new THREE.Vector3(7, 0.05, 3),        // Third turn
          destinationPoint                      // Executive office
        ];
        break;
      case 'Cafeteria':
        destinationPoint = new THREE.Vector3(7, 0.05, -8);        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),        // Start
          new THREE.Vector3(3, 0.05, 0),        // First turn
          new THREE.Vector3(3, 0.05, -6),       // Second turn
          destinationPoint                      // Cafeteria
        ];
        break;
      case 'Starbucks':
        destinationPoint = new THREE.Vector3(-7, 0.05, 7);
        pathPoints = [
          new THREE.Vector3(0, 0.05, 0),
          new THREE.Vector3(-3, 0.05, 0),
          new THREE.Vector3(-3, 0.05, 5),
          destinationPoint
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
    // Calculate total path length for ETA
    let totalPathLength = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      totalPathLength += pathPoints[i].distanceTo(pathPoints[i + 1]);
    }
    
    // Set ETA based on path length and navigation mode
    let speedMultiplier = 1;
    switch (navMode) {
      case 'wheelchair': speedMultiplier = 1.2; break;
      case 'stairs': speedMultiplier = 0.9; break;
      case 'elevator': speedMultiplier = 1.5; break;
    }
    
    const calculatedETA = Math.round(totalPathLength * 30 * speedMultiplier); // 30 seconds per unit
    const totalFeet = Math.round(totalPathLength * 10); // 10 feet per unit, approximate
      // Set initial values
    setEtaSeconds(calculatedETA);
    setDistanceFeet(totalFeet);
    setCurrentDirection('forward'); // Always start with forward direction
    
    // Initialize tracking variables for the updateNavigationUI function
    let lastDirection = 'forward';
    let lastFeet = totalFeet;
    let lastEta = calculatedETA;

    // Create a more visible path
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineDashedMaterial({ 
      color: isDarkMode ? jpmcColors.accentBlue : jpmcColors.accent,
      linewidth: 3,
      scale: 1,
      dashSize: 0.3,
      gapSize: 0.1,
    });
    const path = new THREE.Line(pathGeometry, pathMaterial);
    if (path.computeLineDistances) path.computeLineDistances(); // For dashed line
    scene.add(path);

    // Add a path indicator that moves along the path
    const pathIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({
      color: jpmcColors.accentOrange,
      emissive: jpmcColors.accentOrange,
      emissiveIntensity: 0.5
      })
    );
    pathIndicator.position.copy(pathPoints[0]);
    pathIndicator.position.y = 0.1;
    scene.add(pathIndicator);

    // Add destination marker with pulsing effect
    const destinationMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32),
      new THREE.MeshStandardMaterial({
      color: jpmcColors.accentOrange,
      transparent: true,
      opacity: 0.7,
      emissive: jpmcColors.accentOrange,
      emissiveIntensity: 0.3
      })
    );
    destinationMarker.position.copy(destinationPoint);
    destinationMarker.position.y = 0.05;
    scene.add(destinationMarker);    // Walking animation with brisk pace
    let frame = 0;
    let pathIndex = 0;
    let animationSpeed = 0.12; // Brisk walking speed
    switch(navMode) {
      case 'wheelchair': animationSpeed = 0.1; break;
      case 'stairs': animationSpeed = 0.08; break;
      case 'elevator': animationSpeed = 0.15; break;
    }

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

    // --- Robust direction and feet update logic ---
    function updateNavigationUI() {
      if (!personPosition) return;
      // Find closest segment and progress
      let closestSegment = 0;
      let minDist = Infinity;
      let closestProjection = 0;
      const dot = new THREE.Vector3(...personPosition);
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const segStart = pathPoints[i];
        const segEnd = pathPoints[i + 1];
        const segVec = new THREE.Vector3().subVectors(segEnd, segStart);
        const dotVec = new THREE.Vector3().subVectors(dot, segStart);
        const segLen = segVec.length();
        const segVecNorm = segVec.clone().normalize();
        const projection = dotVec.dot(segVecNorm) / segLen;
        const proj = Math.max(0, Math.min(1, projection));
        const projPoint = new THREE.Vector3().addVectors(segStart, segVecNorm.clone().multiplyScalar(proj * segLen));
        const dist = dot.distanceTo(projPoint);
        if (dist < minDist) {
          minDist = dist;
          closestSegment = i;
          closestProjection = proj;
        }
      }
      // Direction logic
      let newDirection = 'forward';
      if (closestSegment < pathPoints.length - 2 && closestProjection > 0.8) {
        const currentVec = new THREE.Vector3().subVectors(pathPoints[closestSegment + 1], pathPoints[closestSegment]).normalize();
        const nextVec = new THREE.Vector3().subVectors(pathPoints[closestSegment + 2], pathPoints[closestSegment + 1]).normalize();
        const angle = currentVec.angleTo(nextVec);
        if (angle > 0.5) {
          const cross = new THREE.Vector3().crossVectors(currentVec, nextVec);
          if (cross.y > 0.1) newDirection = 'left';
          else if (cross.y < -0.1) newDirection = 'right';
        } else {
          newDirection = 'forward';
        }
      } else {
        newDirection = 'forward';
      }
      if (closestSegment > 0 && closestSegment < pathPoints.length - 2 && closestProjection < 0.2) {
        newDirection = 'forward';
      }
      if (navMode === 'stairs') newDirection = 'stairs';
      else if (navMode === 'elevator') newDirection = 'elevator';
      // Feet calculation
      let remaining = 0;
      const distToNextPoint = dot.distanceTo(pathPoints[closestSegment + 1]);
      remaining += distToNextPoint;
      for (let i = closestSegment + 1; i < pathPoints.length - 1; i++) {
        remaining += pathPoints[i].distanceTo(pathPoints[i + 1]);
      }
      const feet = Math.max(0, Math.round(remaining * 10));
      const eta = Math.max(0, Math.round(remaining * 30 * speedMultiplier));
      // Only update if changed to avoid extra renders
      setDistanceFeet(f => (f !== feet ? feet : f));
      setEtaSeconds(e => (e !== eta ? eta : e));
      setCurrentDirection(d => (d !== newDirection ? newDirection as typeof currentDirection : d));
    }

    function animate(frame = 0) {
      frame++;

      // Move the person along the path
      if (pathIndex < animationPoints.length - 1) {
        // Interpolate for extra smoothness
        const current = animationPoints[pathIndex];
        const next = animationPoints[pathIndex + 1];
        const lerpT = 0.5; // halfway between points for smoothness
        const interp = new THREE.Vector3().lerpVectors(current, next, lerpT);
        if (personGroup) {
          personGroup.position.x = interp.x;
          personGroup.position.z = interp.z;
          setPersonPosition([personGroup.position.x, personGroup.position.y, personGroup.position.z]);
        }
        pathIndicator.position.x = interp.x;
        pathIndicator.position.z = interp.z;
        // Calculate direction for next position
        const direction = new THREE.Vector2(next.x - current.x, next.z - current.z);
        if (direction.length() > 0.001) {
          const angle = Math.atan2(direction.y, direction.x);
          personGroup.rotation.y = -angle;
          setPersonRotation([0, personGroup.rotation.y, 0]);
        }
        pathIndex += 1; // Move every frame for fluid motion
      } else {
        // At destination
        if (personGroup && animationPoints.length > 0) {
          const lastPoint = animationPoints[animationPoints.length - 1];
          personGroup.position.set(lastPoint.x, 0, lastPoint.z);
          setPersonPosition([lastPoint.x, 0, lastPoint.z]);
        }
      }
      // Pulse effect for destination marker
      if (destinationMarker) {
        destinationMarker.scale.x = 1 + Math.sin(frame * 0.05) * 0.2;
        destinationMarker.scale.z = 1 + Math.sin(frame * 0.05) * 0.2;
        destinationMarker.material.opacity = 0.5 + Math.sin(frame * 0.05) * 0.3;
      }
      // Always update navigation UI every frame
      updateNavigationUI();
      // Call navigation update callback every frame
      if (onNavigationUpdate) {
        onNavigationUpdate({
          eta: etaSeconds,
          feet: distanceFeet,
          direction: currentDirection
        });
      }
      if (controls) controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
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
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      if (controls) controls.dispose();
    };
  }, [destination, isDarkMode, navMode]); // Re-render when these props change

  return (
    <>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: isDarkMode ? jpmcColors.accent : jpmcColors.primary,
          fontWeight: 'bold'
        }}>
          Loading 3D Office...
        </div>
      )}
      <EnhancedGoogleStyle3DView
        destination={destination}
        eta={etaSeconds}
        distance={distanceFeet}
        direction={currentDirection}
        navMode={navMode}
        isDarkMode={isDarkMode}
      >
        <div 
          ref={mountRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            borderRadius: '12px', 
            boxShadow: isDarkMode ? 
              `0 4px 20px ${jpmcColors.secondary}80` : 
              `0 2px 16px ${jpmcColors.secondary}40`, 
            margin: 'auto',
            position: 'relative',
            overflow: 'hidden'
          }} 
        >
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            {!isLoading && (
              <Enhanced3DPerson 
                isDarkMode={isDarkMode} 
                personType={navMode === 'wheelchair' ? 'diverse' : personTypeRef.current} 
                position={personPosition}
                rotation={personRotation}
                scale={[0.5, 0.5, 0.5]}
              />
            )}
          </div>
          {/* Live navigation banner overlay */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: isDarkMode ? jpmcColors.secondary : jpmcColors.white,
            color: isDarkMode ? jpmcColors.white : jpmcColors.primary,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: 18,
            zIndex: 20,
            minWidth: 220,
            border: `2px solid ${isDarkMode ? jpmcColors.accentBlue : jpmcColors.primary}`
          }}>
            <span style={{marginRight: 16}}>Direction: <b style={{color: jpmcColors.accentBlue}}>{currentDirection.toUpperCase()}</b></span>
            <span>Feet left: <b style={{color: jpmcColors.accentOrange}}>{distanceFeet}</b></span>
          </div>
        </div>
      </EnhancedGoogleStyle3DView>
      <div style={{ 
        marginTop: isLoading ? '8px' : '380px', 
        fontSize: '0.85rem', 
        color: isDarkMode ? jpmcColors.accent : jpmcColors.secondary,
        textAlign: 'center' 
      }}>
        Destination: {destination} | ETA: {Math.floor(etaSeconds / 60)}:{(etaSeconds % 60).toString().padStart(2, '0')}
      </div>
    </>
  );
}

export default Office3D;
