import React, { useEffect, useRef, useState } from 'react';
import GoogleStyleARView from './GoogleStyleARView';
import type { NavigationMode } from './types';

interface ARLiveNavigationProps {
  destination: string;
  destinationPosition: { x: number; y: number; z: number };
  navMode: NavigationMode;
  isDarkMode?: boolean;
  onToggleViewMode?: () => void;
}

// Simulate user movement for demo; replace with real position tracking for production
const SPEED_FEET_PER_SEC = 4.5; // ~3mph walking

const ARLiveNavigation: React.FC<ARLiveNavigationProps> = ({
  destination,
  destinationPosition,
  navMode,
  isDarkMode = false,
  onToggleViewMode
}) => {
  const [userPos, setUserPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [eta, setEta] = useState(120);
  const [distance, setDistance] = useState(50);
  const [direction, setDirection] = useState<'forward' | 'left' | 'right' | 'stairs' | 'elevator'>('forward');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate direction based on user and destination positions
  function getDirectionType(user: { x: number; z: number }, dest: { x: number; z: number }, navMode: NavigationMode) {
    if (navMode === 'stairs') return 'stairs';
    if (navMode === 'elevator') return 'elevator';
    const dx = dest.x - user.x;
    const dz = dest.z - user.z;
    if (Math.abs(dx) > Math.abs(dz)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dz < 0 ? 'forward' : 'forward';
    }
  }

  // Simulate movement toward destination
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setUserPos({ x: 0, y: 0, z: 0 });
    intervalRef.current = setInterval(() => {
      setUserPos(prev => {
        const dx = destinationPosition.x - prev.x;
        const dz = destinationPosition.z - prev.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.5) return prev; // Arrived
        const step = Math.min(SPEED_FEET_PER_SEC / 10, dist); // Move 1/10th sec
        const nx = prev.x + (dx / dist) * step;
        const nz = prev.z + (dz / dist) * step;
        return { ...prev, x: nx, z: nz };
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [destinationPosition.x, destinationPosition.z]);

  // Update ETA, distance, direction as user moves
  useEffect(() => {
    const dx = destinationPosition.x - userPos.x;
    const dz = destinationPosition.z - userPos.z;
    const distFeet = Math.sqrt(dx * dx + dz * dz) * 10; // 10 feet per unit
    setDistance(Math.round(distFeet));
    setEta(Math.max(0, Math.round(distFeet / SPEED_FEET_PER_SEC)));
    setDirection(getDirectionType(userPos, destinationPosition, navMode));
  }, [userPos, destinationPosition, navMode]);

  return (
    <GoogleStyleARView
      active={true}
      direction={direction}
      destination={destination}
      eta={eta}
      distance={distance}
      isDarkMode={isDarkMode}
      onToggleViewMode={onToggleViewMode}
      onCameraReady={() => {}}
      onCameraError={() => {}}
    />
  );
};

export default ARLiveNavigation;
