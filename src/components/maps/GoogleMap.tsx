import React, { useRef, useState, useEffect } from 'react';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import { useMapMarkers, ShiftMarker } from './hooks/useMapMarkers';
import { useInfoWindow } from './hooks/useInfoWindow';
import { useAdBlockerDetection } from './hooks/useAdBlockerDetection';
import { DEFAULT_MAP_OPTIONS } from '../../config/maps';
import { Shift } from '../../types/shifts';
import AdBlockerWarning from './components/AdBlockerWarning';
import { Box, Flex, Spinner, Heading, Text } from '@chakra-ui/react';

/**
 * Props for the GoogleMap component
 */
export interface GoogleMapProps {
  // Data
  shifts: Shift[];
  selectedShiftId: string | null;
  
  // Event handlers
  onMarkerClick: (shift: Shift) => void;
  
  // Customization
  renderInfoContent?: (shift: Shift) => React.ReactNode;
  mapOptions?: google.maps.MapOptions;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  height?: string;
  width?: string;
}

/**
 * GoogleMap component for displaying shifts on a Google Map
 * 
 * This component handles map initialization, markers, info windows,
 * and ad blocker detection.
 */
const GoogleMap: React.FC<GoogleMapProps> = ({
  shifts,
  selectedShiftId,
  onMarkerClick,
  renderInfoContent,
  mapOptions,
  className = '',
  style = {},
  height = '500px',
  width = '100%',
}) => {
  // Refs for DOM elements and Google Maps objects
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  
  // UI state
  const [adBlockerDismissed, setAdBlockerDismissed] = useState(false);
  
  // Use custom hooks for Google Maps functionality
  const { 
    isLoaded, 
    isLoading, 
    loadError, 
    isBlocked 
  } = useGoogleMapsLoader();
  
  const isAdBlocked = useAdBlockerDetection();
  // Disable ad blocker warning
  const showAdBlockerWarning = false;
  
  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Create the map instance with default and custom options
      const mapInstance = new google.maps.Map(mapRef.current, {
        ...DEFAULT_MAP_OPTIONS,
        ...mapOptions,
      });
      
      // Store the map instance
      mapInstanceRef.current = mapInstance;
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [isLoaded, mapOptions]);
  
  // Use the markers hook to manage map markers
  const { markers, isLoading: isLoadingMarkers } = useMapMarkers({
    mapInstance: mapInstanceRef.current,
    shifts,
    selectedShiftId,
    onMarkerClick,
  });
  
  // Find the selected shift object
  const selectedShift = selectedShiftId 
    ? shifts.find(shift => shift.id === selectedShiftId) || null 
    : null;
  
  // Use the info window hook to display shift details
  useInfoWindow({
    mapInstance: mapInstanceRef.current,
    selectedShift,
    renderInfoContent,
  });
  
  // Ad blocker warning handlers
  const handleDismissAdBlockerWarning = (): void => {
    setAdBlockerDismissed(true);
  };
  
  const handleTryMapAnyway = (): void => {
    setAdBlockerDismissed(true);
  };
  
  // Display error if Google Maps failed to load
  if (loadError) {
    return (
      <Box 
        ref={mapRef}
        position="relative"
        width="100%"
        height={height || "500px"}
        className={`google-map-error ${className}`}
        style={{ ...style, width, height }}
      >
        <Flex 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          zIndex="10"
          bg="rgba(255, 255, 255, 0.9)"
          align="center"
          justify="center"
          padding={4}
        >
          <Box textAlign="center" maxW="400px">
            <Heading size="md" color="red.500" mb={2}>Map Error</Heading>
            <Text>{loadError.message}</Text>
          </Box>
        </Flex>
      </Box>
    );
  }
  
  // Display ad blocker warning if Google Maps is blocked
  if (isBlocked && !adBlockerDismissed) {
    return (
      <Box 
        ref={mapRef}
        position="relative"
        width="100%"
        height={height || "500px"}
        className={`google-map-blocked ${className}`}
        style={{ ...style, width, height }}
      >
        <AdBlockerWarning 
          onDismiss={handleDismissAdBlockerWarning}
          onTryAnyway={handleTryMapAnyway}
        />
      </Box>
    );
  }
  
  // Display the map
  return (
    <Box 
      ref={mapRef}
      position="relative"
      width="100%"
      height={height || "500px"}
      className={`google-map-container ${className}`}
      style={{ ...style, width, height }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <Flex 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          zIndex="10"
          bg="rgba(255, 255, 255, 0.7)"
          align="center"
          justify="center"
        >
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      )}
      
      {/* Ad blocker warning (compact version) */}
      {showAdBlockerWarning && !isBlocked && (
        <AdBlockerWarning 
          compact={true}
          onDismiss={handleDismissAdBlockerWarning}
        />
      )}
      
      {/* The actual map container */}
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
        data-testid="google-map-container"
      />
    </Box>
  );
};

export default GoogleMap; 