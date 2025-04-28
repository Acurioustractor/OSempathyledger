import { useRef, useState, useEffect } from 'react';
import { Shift } from '../../../types/shifts';

export interface MapOptions extends Omit<google.maps.MapOptions, 'center'> {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  maxZoom?: number;
  minZoom?: number;
  styles?: google.maps.MapTypeStyle[];
}

export interface UseMapInstanceProps {
  isLoaded: boolean;
  mapOptions?: MapOptions;
  onMapInitialized?: (map: google.maps.Map) => void;
}

export interface UseMapInstanceResult {
  mapInstance: google.maps.Map | null;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  isMapInitialized: boolean;
}

/**
 * Hook that creates and manages a Google Map instance
 */
export function useMapInstance({
  isLoaded,
  mapOptions,
  onMapInitialized
}: UseMapInstanceProps): UseMapInstanceResult {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // Initialize map when Google Maps is loaded and container is ready
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstance) return;
    
    try {
      // Create new map instance
      const map = new google.maps.Map(
        mapContainerRef.current, 
        {
          zoom: 10,
          center: { lat: -35.2809, lng: 149.1300 }, // Default: Canberra
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          ...mapOptions
        }
      );
      
      // Store reference to map
      setMapInstance(map);
      setIsMapInitialized(true);
      
      // Notify parent component if callback provided
      if (onMapInitialized) {
        onMapInitialized(map);
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [isLoaded, mapOptions, mapInstance, onMapInitialized]);
  
  return {
    mapInstance,
    mapContainerRef,
    isMapInitialized
  };
} 