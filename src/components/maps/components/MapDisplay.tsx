import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import MapContainer from '../../MapContainer';
import MapLoading from './MapLoading';
import MapError from './MapError';
import MapLegend from './MapLegend';
import AdBlockerWarning from './AdBlockerWarning';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../../config/maps';

interface MapDisplayProps {
  isLoaded: boolean;
  isLoading: boolean;
  loadingProgress: number;
  loadingStatus: string;
  error: string | null;
  isAdBlocked: boolean;
  mapInitialized: boolean;
  onContainerReady: (container: HTMLDivElement) => void;
  onRetry: () => void;
  children?: React.ReactNode;
}

/**
 * MapDisplay - Component to display the Google Map and its various states
 */
const MapDisplay: React.FC<MapDisplayProps> = ({
  isLoaded,
  isLoading,
  loadingProgress,
  loadingStatus,
  error,
  isAdBlocked,
  mapInitialized,
  onContainerReady,
  onRetry,
  children
}) => {
  // Function to handle when the container is ready
  const handleContainerReady = useCallback((element: HTMLDivElement) => {
    console.log("Map container ready:", element);
    onContainerReady(element);
  }, [onContainerReady]);
  
  return (
    <Box position="relative" height="100%" width="100%">
      {/* Main map container */}
      <MapContainer onContainerReady={handleContainerReady}>
        {/* Loading overlay */}
        {isLoading && (
          <MapLoading progress={loadingProgress} status={loadingStatus} />
        )}
        
        {/* Error overlay */}
        {error && (
          <MapError error={error} onRetry={onRetry} />
        )}
        
        {/* Ad blocker warning */}
        {isAdBlocked && <AdBlockerWarning />}
        
        {/* Map legend */}
        {!isLoading && mapInitialized && <MapLegend />}
        
        {/* Additional children content */}
        {children}
      </MapContainer>
    </Box>
  );
};

export default MapDisplay; 