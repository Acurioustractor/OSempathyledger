import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, Text, Button } from '@chakra-ui/react';

// Get the API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Shift {
  id: string;
  Name?: string;
  Address?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface BasicMapProps {
  width?: string;
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  shifts?: Shift[];
  selectedShiftId?: string | null;
  onShiftSelect?: (shiftId: string) => void;
}

/**
 * BasicMap - A simple Google Maps component
 * This is a minimal implementation that directly loads and renders a Google Map
 */
const BasicMap: React.FC<BasicMapProps> = ({
  width = '100%',
  height = '500px',
  center = { lat: -35.2809, lng: 149.1300 }, // Default to Canberra
  zoom = 11,
  shifts = [],
  selectedShiftId = null,
  onShiftSelect = () => {},
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Function to load the Google Maps API script
  const loadGoogleMapsScript = () => {
    // Skip if already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setIsLoaded(true);
      initializeMap();
      return;
    }
    
    console.log('Loading Google Maps script');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Define the callback function globally
    window.initMap = () => {
      console.log('Google Maps loaded via callback');
      setIsLoaded(true);
      initializeMap();
    };
    
    // Handle errors
    script.onerror = () => {
      console.error('Error loading Google Maps');
      setIsError(true);
      setErrorMessage('Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);
  };
  
  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error('Map container or Google Maps not available');
      return;
    }
    
    try {
      // Check if map container has dimensions
      const width = mapRef.current.offsetWidth;
      const height = mapRef.current.offsetHeight;
      
      console.log(`Map container dimensions: ${width}x${height}`);
      
      if (width === 0 || height === 0) {
        console.warn('Map container has zero dimensions');
        // Force dimensions
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '500px';
      }
      
      // Create the map
      const mapOptions: google.maps.MapOptions = {
        center,
        zoom,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };
      
      console.log('Creating Google Map instance');
      const map = new google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;
      
      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow();
      
      // Add an event listener for when the map is loaded
      map.addListener('idle', () => {
        console.log('Map is fully loaded and idle');
        createMarkers();
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsError(true);
      setErrorMessage(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Create markers for shifts
  const createMarkers = () => {
    if (!googleMapRef.current || !shifts.length) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    console.log(`Creating ${shifts.length} markers for shifts`);
    
    // Create new markers
    shifts.forEach(shift => {
      if (!shift.location) {
        console.warn(`Shift ${shift.id} has no location data`);
        return;
      }
      
      const marker = new google.maps.Marker({
        position: shift.location,
        map: googleMapRef.current,
        title: shift.Name || 'Unknown location',
        animation: selectedShiftId === shift.id ? google.maps.Animation.BOUNCE : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: selectedShiftId === shift.id ? '#FF5722' : '#4285F4',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        }
      });
      
      // Add click listener
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          
          // Set content for info window
          const content = `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${shift.Name || 'Unknown location'}</h3>
              ${shift.Address ? `<p style="margin-top: 5px;">${shift.Address}</p>` : ''}
              <button 
                id="view-shift-${shift.id}" 
                style="
                  background-color: #4285F4; 
                  color: white; 
                  border: none; 
                  padding: 5px 10px; 
                  border-radius: 4px; 
                  margin-top: 8px; 
                  cursor: pointer;
                "
              >
                View Details
              </button>
            </div>
          `;
          
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(googleMapRef.current, marker);
          
          // Add click listener to the button after a short delay
          setTimeout(() => {
            const button = document.getElementById(`view-shift-${shift.id}`);
            if (button) {
              button.addEventListener('click', (e) => {
                e.preventDefault();
                onShiftSelect(shift.id);
                infoWindowRef.current?.close();
              });
            }
          }, 100);
        }
      });
      
      markersRef.current.push(marker);
    });
  };
  
  // Center the map on a selected shift
  const centerMapOnShift = () => {
    if (!googleMapRef.current || !selectedShiftId) return;
    
    const selectedShift = shifts.find(s => s.id === selectedShiftId);
    if (!selectedShift || !selectedShift.location) return;
    
    googleMapRef.current.panTo(selectedShift.location);
    googleMapRef.current.setZoom(14);
  };
  
  // Initialize the map when the component mounts
  useEffect(() => {
    loadGoogleMapsScript();
    
    // Cleanup
    return () => {
      // Remove the global callback
      if (window.initMap) {
        // @ts-ignore - we know this exists because we added it
        delete window.initMap;
      }
      
      // Clean up markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);
  
  // Update markers when shifts or selectedShiftId changes
  useEffect(() => {
    if (isLoaded && googleMapRef.current) {
      createMarkers();
      
      if (selectedShiftId) {
        centerMapOnShift();
      }
    }
  }, [shifts, selectedShiftId, isLoaded]);
  
  // Try again if there was an error
  const handleRetry = () => {
    setIsError(false);
    setErrorMessage('');
    loadGoogleMapsScript();
  };
  
  if (isError) {
    return (
      <Box
        width={width}
        height={height}
        borderRadius="md"
        backgroundColor="gray.100"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Text fontSize="lg" fontWeight="bold" color="red.500" mb={4}>
          Error loading map
        </Text>
        <Text mb={4}>{errorMessage}</Text>
        <Button colorScheme="blue" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box
      width={width}
      height={height}
      position="relative"
    >
      {/* The map container */}
      <Box
        ref={mapRef}
        width="100%"
        height="100%"
        borderRadius="md"
        overflow="hidden"
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(255, 255, 255, 0.8)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
        >
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Loading map...</Text>
        </Box>
      )}
    </Box>
  );
};

// Add type declaration for the global callback
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default BasicMap; 