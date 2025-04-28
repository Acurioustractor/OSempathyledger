import { useEffect, useRef, useState, useCallback } from 'react';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../../config/maps';

interface UseMapInitializerProps {
  isLoaded: boolean;
  mapContainer: HTMLDivElement | null;
}

interface UseMapInitializerReturn {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  mapInitialized: boolean;
  initMap: () => void;
}

/**
 * Custom hook to initialize Google Maps
 */
export function useMapInitializer({
  isLoaded,
  mapContainer
}: UseMapInitializerProps): UseMapInitializerReturn {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  /**
   * Initialize the map with settings
   */
  const initMap = useCallback(() => {
    if (!isLoaded || !mapContainer || mapRef.current) return;
    
    try {
      console.log('Initializing map...');
      
      // Create map with optimized settings
      const mapOptions: google.maps.MapOptions = {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        minZoom: 3, // Prevent zooming out too far
        maxZoom: 18, // Prevent zooming in too far
        gestureHandling: 'cooperative', // Improved mobile experience
        clickableIcons: false, // Prevent clicking on Google landmarks
        fullscreenControl: true,
        fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        streetViewControl: false, // Disable street view for simplicity
        mapTypeControl: false, // Disable map type options for simplicity
        backgroundColor: '#f8f9fa', // Light gray background
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180
          },
          strictBounds: true // Keep the map within these bounds
        },
        styles: [
          // Remove POIs and transit for cleaner map
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      };
      
      // Create the map
      mapRef.current = new google.maps.Map(mapContainer, mapOptions);
      console.log('Map instance created');
      
      // Add map event listeners
      mapRef.current.addListener('idle', () => {
        console.log('Map idle');
        setMapInitialized(true);
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      mapRef.current = null;
    }
  }, [isLoaded, mapContainer]);
  
  // Initialize map when dependencies are ready
  useEffect(() => {
    if (isLoaded && mapContainer && !mapRef.current) {
      initMap();
    }
  }, [isLoaded, mapContainer, initMap]);
  
  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map instance');
        // @ts-ignore - We need to reset the map to allow garbage collection
        mapRef.current = null;
      }
    };
  }, []);
  
  return {
    mapRef,
    mapInitialized,
    initMap
  };
} 