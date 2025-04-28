import React, { useCallback, useState, useRef } from 'react';
import { Box, Text, Center, Button, useToast } from '@chakra-ui/react';
import { createPortal } from 'react-dom';
import { Shift, Story } from '../../types';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import { useAdBlockerDetection } from './hooks/useAdBlockerDetection';
import { useMapInitializer } from './hooks/useMapInitializer';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useInfoWindow, InfoWindowContentProps } from './hooks/useInfoWindow';
import MapDisplay from './components/MapDisplay';
import InfoWindowContent from './components/InfoWindowContent';
import AdBlockerWarning from './components/AdBlockerWarning';
import GoogleMapsKeyManager from '../GoogleMapsKeyManager';
import { getMarkerColor, DEFAULT_MARKERS } from './utils/markerUtils';
import styled from 'styled-components';
import { DEFAULT_MAP_OPTIONS } from '../../config/maps';
import { useMapInstance } from './hooks/useMapInstance';
import MapLoadingIndicator from './components/MapLoadingIndicator';
import MapErrorMessage from './components/MapErrorMessage';

interface ShiftsMapProps {
  shifts: Shift[];
  stories: Story[];
  selectedShiftId?: string | number | null;
  onShiftSelect?: (shiftId: string | number) => void;
  onViewStories?: (shiftId: string | number) => void;
  height?: string;
  width?: string;
  className?: string;
}

const MapContainer = styled.div<{ height?: string; width?: string }>`
  position: relative;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '500px'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
`;

/**
 * ShiftsMap - Refactored component that displays shifts on a Google Map
 * 
 * This is a cleaner, more maintainable version of the original ShiftsMapComponent
 * with better separation of concerns and more focused components.
 */
const ShiftsMap: React.FC<ShiftsMapProps> = ({
  shifts,
  stories,
  selectedShiftId,
  onShiftSelect,
  onViewStories,
  height,
  width,
  className,
}) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [adBlockerDismissed, setAdBlockerDismissed] = useState(false);
  
  // State for map container
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Portal container for info window content
  const infoWindowPortalRef = useRef<HTMLDivElement | null>(null);
  
  // Toast for error notifications
  const toast = useToast();
  
  // Custom hooks
  const { isLoaded, isError, errorMessage } = useGoogleMapsLoader();
  const { isDetected: isAdBlocked } = useAdBlockerDetection();
  const showAdBlockerWarning = isAdBlocked && !adBlockerDismissed;
  const { mapRef, mapInitialized, initMap } = useMapInitializer({ isLoaded, mapContainer });
  
  // Initialize map instance when API is loaded
  const { mapInstance, mapContainerRef } = useMapInstance({
    isLoaded,
    mapOptions: DEFAULT_MAP_OPTIONS,
  });
  
  // Handle marker click
  const handleMarkerClick = useCallback((shift: Shift) => {
    setSelectedShift(shift);
    onShiftSelect?.(shift.id || shift.Id);
  }, [onShiftSelect]);

  // Handle "View All Stories" button click in info window
  const handleViewAllStories = useCallback(() => {
    if (selectedShift && onViewStories) {
      onViewStories(selectedShift.id || selectedShift.Id);
    }
  }, [selectedShift, onViewStories]);
  
  // Render function for info window content
  const renderInfoContent = useCallback((props: InfoWindowContentProps) => {
    return <InfoWindowContent {...props} />;
  }, []);
  
  // Map markers hook
  // Create a storyCountByShift map for marker sizing
  const storyCountByShift = React.useMemo(() => {
    const countMap: Record<string, number> = {};
    shifts.forEach(shift => {
      const shiftId = shift.id || shift.Id || '';
      if (!shiftId) return;
      
      countMap[shiftId] = stories.filter(story => 
        story.shiftId === shiftId || story.ShiftId === shiftId
      ).length;
    });
    return countMap;
  }, [shifts, stories]);

  const { 
    createMarkers, 
    clearMarkers, 
    markersRef,
    isLoading,
    loadingProgress,
    loadingStatus
  } = useMapMarkers({
    mapInstance,
    shifts,
    selectedShiftId: selectedShiftId?.toString() || null,
    storyCountByShift,
    onMarkerClick: handleMarkerClick,
    getMarkerColor
  });
  
  // Info window hook
  const {
    infoWindowRef,
    infoWindowContent,
    openInfoWindow,
    closeInfoWindow
  } = useInfoWindow({
    mapInstance,
    selectedShift,
    stories: stories.filter(story => 
      selectedShift && 
      (story.shiftId === selectedShift.id || story.ShiftId === selectedShift.Id)
    ),
    onClose: () => setSelectedShift(null),
    onViewAllStories: handleViewAllStories,
    renderInfoContent
  });
  
  // Container ready handler
  const handleContainerReady = useCallback((container: HTMLDivElement) => {
    setMapContainer(container);
  }, []);
  
  // Retry handler for errors
  const handleRetry = useCallback(() => {
    setError(null);
    initMap();
  }, [initMap]);
  
  // Handle dismissing the ad blocker warning
  const handleDismissAdBlockerWarning = () => {
    setAdBlockerDismissed(true);
  };
  
  // Handle try anyway for ad blocker warning
  const handleTryMapAnyway = () => {
    setAdBlockerDismissed(true);
    // Will continue to attempt to load the map
  };
  
  // Effect to initialize markers when the map is ready
  React.useEffect(() => {
    if (mapRef.current && mapInitialized && shifts.length > 0) {
      createMarkers();
    }
  }, [mapRef.current, mapInitialized, shifts, createMarkers]);
  
  // If there's an error loading the map
  if (isError) {
    return (
      <MapContainer height={height} width={width} className={className}>
        <MapErrorMessage message={errorMessage} />
      </MapContainer>
    );
  }
  
  // Ad blocker detection is currently disabled in useAdBlockerDetection.ts, 
  // but we'll keep the UI logic in case it's enabled again in the future

  return (
    <MapContainer height={height} width={width} className={className}>
      {!isLoaded && <MapLoadingIndicator />}
      <MapElement ref={mapContainerRef} />
      
      {/* Show compact ad blocker warning if we're still trying to load */}
      {showAdBlockerWarning && (
        <AdBlockerWarning
          compact={true}
          onDismiss={handleDismissAdBlockerWarning}
        />
      )}
      
      {/* Compact key manager at top */}
      <Box position="absolute" top={2} left={2} zIndex={11}>
        <GoogleMapsKeyManager 
          compact={true}
          onKeyChanged={() => {
            // Reset map when API key changes
            setTimeout(() => {
              if (mapRef.current && mapContainer) {
                console.log('Reinitializing map after API key change');
                clearMarkers();
                // @ts-ignore - Reset map to force re-initialization
                mapRef.current = null;
                initMap();
              }
            }, 100);
          }}
        />
      </Box>
      
      {/* Info window portal container */}
      {infoWindowContent && createPortal(
        infoWindowContent,
        document.getElementById('info-window-container') || document.body
      )}
      
      {/* Hidden container for info window portal */}
      <div id="info-window-container" style={{ display: 'none' }} />
    </MapContainer>
  );
};

export default ShiftsMap; 