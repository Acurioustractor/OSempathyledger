/**
 * Maps Component Library
 * 
 * This file exports a standardized interface for map components.
 * Use MapView for most use cases, and the lower-level components
 * only when custom implementations are needed.
 */

// Main components
export { default as GoogleMap } from './GoogleMap';
export { default as MapView } from '../MapView';
export { default as ShiftsMap } from './ShiftsMap';

// Hooks
export { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
export { useMapMarkers, type ShiftMarker } from './hooks/useMapMarkers';
export { useInfoWindow } from './hooks/useInfoWindow';
export { useAdBlockerDetection } from './hooks/useAdBlockerDetection';
export { useMapInitializer } from './hooks/useMapInitializer';
export { useMapInstance } from './hooks/useMapInstance';

// UI Components
export { default as InfoWindowContent } from './InfoWindowContent';
export { default as MapDisplay } from './components/MapDisplay';
export { default as MapLoading } from './components/MapLoading';
export { default as MapError } from './components/MapError';
export { default as MapLegend } from './components/MapLegend';
export { default as AdBlockerWarning } from './components/AdBlockerWarning';
export { default as MapContainer } from '../MapContainer';
export { default as GoogleMapsKeyManager } from '../GoogleMapsKeyManager';
export { default as GoogleMapsTest } from '../GoogleMapsTest';

// Types
export type { GoogleMapsLoadingState } from './hooks/useGoogleMapsLoader';
export type { InfoWindowContentProps } from './hooks/useInfoWindow';

// Services
export { default as googleMapsLoader } from '../../services/googleMapsLoader';

// Utilities
export { getMarkerColor, DEFAULT_LOCATIONS, DEFAULT_MARKERS } from './utils/markerUtils';

// Configuration
export { DEFAULT_MAP_OPTIONS } from '../../config/maps';

// Testing utilities
export { 
  testGoogleMapsAPI, 
  testGoogleMapsJsAPI, 
  testWithNewApiKey, 
  runGoogleMapsTests 
} from '../../utils/googleMapsTest'; 