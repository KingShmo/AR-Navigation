# JPMorgan Chase AR Office Navigation

## Overview
This application is a modern, minimal, and beautiful AR web app built with React, TypeScript, and Three.js. It features:
- JPMorgan Chase color palette and branding
- 3D office visualization
- Animated avatar walking through an office environment
- Real-time ETA display
- Multiple destination selection
- Navigation mode preferences (walking, wheelchair, stairs, elevator)

## Features
1. **Interactive 3D Office Environment**
   - Realistic office layout with desks, meeting rooms, and walkable paths
   - Smooth animations for the walking avatar

2. **Dynamic ETA Tracking**
   - Real-time countdown of estimated time to arrival
   - ETA adjustments based on selected navigation mode
   - Pause/Resume and Reset functionality

3. **Multiple Destination Options**
   - Select from various office locations
   - Each destination has its own custom ETA

4. **Navigation Preferences**
   - Support for different navigation modes
   - Each mode affects the calculated ETA

## Technology Stack
- **React** with TypeScript for UI and state management
- **Three.js** for 3D rendering and animations
- **Vite** for fast development and optimized builds

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at [http://localhost:5173](http://localhost:5173)

## Project Structure
- `src/Office3D.tsx`: 3D scene and animation
- `src/ETADisplay.tsx`: Dynamic ETA countdown component
- `src/LocationSelector.tsx`: Destination selection interface
- `src/NavigationSettings.tsx`: Navigation mode preferences
- `src/jpmcTheme.ts`: JPMorgan Chase color palette
- `src/types.ts`: TypeScript type definitions
- `src/App.tsx`: Main app layout and state management

## Future Enhancements
- Integration with real indoor positioning systems
- More detailed 3D models and textures
- Multi-floor navigation
- AR view using device camera
- Real-time occupancy data integration

---

This project was bootstrapped with Vite + React + TypeScript.
