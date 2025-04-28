/**
 * Maps Hooks
 * 
 * This file exports all hooks related to the maps components.
 * These hooks handle various aspects of map functionality such as:
 * - Loading Google Maps API
 * - Creating and managing markers
 * - Displaying info windows
 * - Detecting ad blockers
 * - Initializing maps
 */

// Map loading and initialization
export { useGoogleMapsLoader } from './useGoogleMapsLoader';
export { useMapInitializer } from './useMapInitializer';
export { useMapInstance } from './useMapInstance';

// Markers and info windows
export { useMapMarkers, type ShiftMarker } from './useMapMarkers';
export { 
  useInfoWindow,
  type InfoWindowContentProps
} from './useInfoWindow';

// Ad blocker detection
export { useAdBlockerDetection } from './useAdBlockerDetection';

// Export type definitions
export type { GoogleMapsLoadingState } from './useGoogleMapsLoader'; 