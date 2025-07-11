// Types for our AR navigation application
export interface Location {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  etaSeconds: number;
}

export interface NavigationPath {
  start: Location;
  end: Location;
  waypoints: {
    x: number;
    y: number;
    z: number;
  }[];
  distance: number;
  estimatedTimeSeconds: number;
}

export interface User {
  id: string;
  name: string;
  currentLocation?: Location;
  destination?: Location;
}

export type NavigationMode = 'walking' | 'wheelchair' | 'stairs' | 'elevator';
