import { useState, useEffect, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Shift } from '../../../types/shifts';

export interface ShiftMarker extends google.maps.Marker {
  shiftId: string;
}

interface UseMapMarkersProps {
  mapInstance: google.maps.Map | null;
  shifts: Shift[];
  selectedShiftId: string | null;
  onMarkerClick: (shift: Shift) => void;
}

interface UseMapMarkersResult {
  markers: ShiftMarker[];
  clusterer: MarkerClusterer | null;
  isLoading: boolean;
}

export const useMapMarkers = ({
  mapInstance,
  shifts,
  selectedShiftId,
  onMarkerClick,
}: UseMapMarkersProps): UseMapMarkersResult => {
  const [markers, setMarkers] = useState<ShiftMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const markersRef = useRef<ShiftMarker[]>([]);

  // Clear existing markers
  const clearMarkers = () => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      });
      markersRef.current = [];
    }

    if (clusterer) {
      clusterer.clearMarkers();
    }
  };

  useEffect(() => {
    // Cleanup function to clear markers on unmount
    return () => {
      clearMarkers();
    };
  }, []);

  useEffect(() => {
    if (!mapInstance || !shifts || shifts.length === 0) {
      clearMarkers();
      setMarkers([]);
      return;
    }

    setIsLoading(true);

    const createMarkers = () => {
      clearMarkers();
      
      const newMarkers: ShiftMarker[] = [];
      
      shifts.forEach((shift) => {
        if (!shift.latitude || !shift.longitude) return;

        // Determine marker color based on story count
        const markerColor = shift.stories && shift.stories.length > 0 ? '#4285F4' : '#EA4335';
        
        // Create custom marker icon
        const markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#FFFFFF',
          scale: 8,
        };

        // Create the marker
        const marker = new google.maps.Marker({
          position: { lat: shift.latitude, lng: shift.longitude },
          map: mapInstance,
          icon: markerIcon,
          title: shift.name || '',
          animation: shift.id === selectedShiftId ? google.maps.Animation.BOUNCE : undefined,
        }) as ShiftMarker;
        
        marker.shiftId = shift.id;

        // Add click listener to marker
        marker.addListener('click', () => {
          onMarkerClick(shift);
        });

        newMarkers.push(marker);
      });

      markersRef.current = newMarkers;
      setMarkers(newMarkers);

      // Create a new MarkerClusterer
      if (newMarkers.length > 0) {
        const newClusterer = new MarkerClusterer({
          map: mapInstance,
          markers: newMarkers,
          algorithm: new MarkerClusterer.GridAlgorithm(),
          renderer: {
            render: ({ count, position }) => {
              return new google.maps.Marker({
                position,
                label: { text: String(count), color: "#ffffff" },
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#1976D2",
                  fillOpacity: 0.8,
                  strokeWeight: 1,
                  strokeColor: "#FFFFFF",
                  scale: 18,
                },
              });
            },
          },
        });
        
        setClusterer(newClusterer);
      }

      setIsLoading(false);
    };

    createMarkers();
  }, [mapInstance, shifts, selectedShiftId, onMarkerClick]);

  // Update marker animation when selected shift changes
  useEffect(() => {
    if (!selectedShiftId || markers.length === 0) return;

    markers.forEach((marker) => {
      if (marker.shiftId === selectedShiftId) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        
        // Center map on the selected marker
        if (mapInstance && marker.getPosition()) {
          mapInstance.panTo(marker.getPosition()!);
        }
      } else {
        marker.setAnimation(null);
      }
    });
  }, [selectedShiftId, markers, mapInstance]);

  return { markers, clusterer, isLoading };
}; 