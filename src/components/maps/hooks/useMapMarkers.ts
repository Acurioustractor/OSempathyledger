import { useCallback, useRef, useState } from 'react';
import { Shift } from '../../../services/airtable';

interface UseMapMarkersProps {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  shifts: Shift[];
  selectedShiftId: string | null;
  storyCountByShift: Record<string, number>;
  onMarkerClick: (shiftId: string) => void;
  getMarkerColor: (storyCount: number) => string;
}

interface UseMapMarkersReturn {
  createMarkers: () => void;
  clearMarkers: () => void;
  centerOnMarker: (markerId: string) => void;
  getMarkerPosition: (markerId: string) => google.maps.LatLng | null;
  markersRef: React.MutableRefObject<Map<string, google.maps.Marker>>;
  isLoading: boolean;
  loadingProgress: number;
  loadingStatus: string;
}

/**
 * Custom hook for managing map markers
 */
export function useMapMarkers({
  mapRef,
  shifts,
  selectedShiftId,
  storyCountByShift,
  onMarkerClick,
  getMarkerColor
}: UseMapMarkersProps): UseMapMarkersReturn {
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Preparing markers...');
  
  /**
   * Clear all markers from the map
   */
  const clearMarkers = useCallback(() => {
    if (markersRef.current.size === 0) return;
    
    console.log(`Clearing ${markersRef.current.size} markers`);
    markersRef.current.forEach(marker => {
      // Remove from map
      marker.setMap(null);
      
      // Remove event listeners
      google.maps.event.clearInstanceListeners(marker);
    });
    
    // Clear the markers map
    markersRef.current.clear();
  }, []);
  
  /**
   * Create markers for all shifts
   */
  const createMarkers = useCallback(() => {
    if (!mapRef.current || !shifts.length) return;

    // Update loading state
    setIsLoading(true);
    setLoadingProgress(10);
    setLoadingStatus("Creating markers...");
    
    // Clear any existing markers
    clearMarkers();
    
    // Total number of shifts to process
    const totalShifts = shifts.length;
    
    // Process shifts in batches for better performance
    const processBatch = (startIndex: number, batchSize: number) => {
      const endIndex = Math.min(startIndex + batchSize, totalShifts);
      
      // Process this batch
      for (let i = startIndex; i < endIndex; i++) {
        const shift = shifts[i];
        
        // Skip if the map has been unmounted
        if (!mapRef.current) return;
        
        // Handle potential property name inconsistencies with optional chaining
        const latitude = shift.latitude ?? shift.Latitude;
        const longitude = shift.longitude ?? shift.Longitude;
        
        if (!latitude || !longitude) {
          console.warn('Shift missing coordinates:', shift.id, shift);
          continue;
        }
        
        // Check for stories associated with this shift
        const storyCount = storyCountByShift[shift.id] || 0;
        
        // Get marker color based on story count
        const markerColors = shift.themes ?? shift.Themes ?? ['default'];
        const markerColor = getMarkerColor(storyCount);
        
        // Create Google Maps marker
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapRef.current,
          title: shift.Name ?? shift.name ?? 'Unnamed location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 10 + Math.min(storyCount, 5)
          },
          zIndex: storyCount ? (storyCount + 100) : 0, // Prioritize shifts with stories
          optimized: false // Fixes issues with markers not appearing
        });
        
        // Store marker reference
        markersRef.current.set(shift.id, marker);
        
        // Add click listener to marker
        marker.addListener('click', () => {
          onMarkerClick(shift.id);
        });
      }
      
      // Calculate progress
      const progress = Math.round((endIndex / totalShifts) * 90) + 10;
      setLoadingProgress(progress);
      
      // Process next batch or finish
      if (endIndex < totalShifts) {
        setTimeout(() => {
          processBatch(endIndex, batchSize);
        }, 10); // Small delay to avoid blocking UI
      } else {
        // All batches processed
        setLoadingStatus("Map ready");
        setLoadingProgress(100);
        setIsLoading(false);
        
        // Center map on selected shift if any
        if (selectedShiftId) {
          centerOnMarker(selectedShiftId);
        }
      }
    };
    
    // Start processing in batches of 20
    processBatch(0, 20);
  }, [shifts, selectedShiftId, storyCountByShift, mapRef, getMarkerColor, onMarkerClick, clearMarkers]);
  
  /**
   * Center the map on a specific marker
   */
  const centerOnMarker = useCallback((markerId: string) => {
    if (!mapRef.current || !markersRef.current.has(markerId)) return;
    
    const marker = markersRef.current.get(markerId);
    if (!marker || !marker.getPosition()) return;
    
    mapRef.current.setCenter(marker.getPosition()!);
    mapRef.current.setZoom(14);
  }, [mapRef]);
  
  /**
   * Get the position of a marker
   */
  const getMarkerPosition = useCallback((markerId: string): google.maps.LatLng | null => {
    if (!markersRef.current.has(markerId)) return null;
    
    const marker = markersRef.current.get(markerId);
    if (!marker) return null;
    
    return marker.getPosition();
  }, []);
  
  return {
    createMarkers,
    clearMarkers,
    centerOnMarker,
    getMarkerPosition,
    markersRef,
    isLoading,
    loadingProgress,
    loadingStatus
  };
} 