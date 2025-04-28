import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

interface MapContainerProps {
  onContainerReady: (element: HTMLDivElement) => void;
  children?: React.ReactNode;
}

/**
 * A dedicated component to create and manage the map container element.
 * This ensures the DOM element exists before we try to initialize Google Maps.
 */
const MapContainer: React.FC<MapContainerProps> = ({ onContainerReady, children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isContainerReady, setIsContainerReady] = useState(false);

  // After mounting, notify parent component that container is ready
  useEffect(() => {
    // Make sure the container exists and has dimensions
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      console.log(`MapContainer mounted with dimensions: ${width}x${height}`);
      
      if (width > 0 && height > 0) {
        setIsContainerReady(true);
        onContainerReady(containerRef.current);
      } else {
        console.warn("MapContainer has zero dimensions, adjusting...");
        // Force dimensions
        containerRef.current.style.width = "100%";
        containerRef.current.style.height = "500px";
        
        // Use a short delay to allow the layout to update
        setTimeout(() => {
          if (containerRef.current) {
            const newWidth = containerRef.current.offsetWidth;
            const newHeight = containerRef.current.offsetHeight;
            console.log(`MapContainer dimensions after adjustment: ${newWidth}x${newHeight}`);
            setIsContainerReady(true);
            onContainerReady(containerRef.current);
          }
        }, 10);
      }
    } else {
      console.error("Failed to get reference to map container");
    }
  }, [onContainerReady]);

  return (
    <Box
      ref={containerRef}
      width="100%"
      height="500px"
      minHeight="500px"
      minWidth="300px"
      borderRadius="md"
      position="relative"
      backgroundColor="gray.100"
      className="map-container"
      id="google-map-container"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      data-ready={isContainerReady ? "true" : "false"}
    >
      {children}
    </Box>
  );
};

export default MapContainer; 