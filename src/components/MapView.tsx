import React, { useState, useEffect, useMemo } from 'react';
import { Box, Heading, Text, Button, Flex, Badge, HStack, Input, InputGroup, InputLeftElement, Icon, useDisclosure, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import GoogleMap from './maps/GoogleMap';
import InfoWindowContent from './maps/InfoWindowContent';
import { useAdBlockerDetection } from './maps/hooks/useAdBlockerDetection';
import AdBlockerWarning from './maps/components/AdBlockerWarning';
import { Shift } from '../types/shifts';

interface MapViewProps {
  shifts: Shift[];
  onShiftSelect?: (shiftId: string) => void;
  selectedShiftId?: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
}

/**
 * MapView Component
 * Displays shifts on a map and allows selecting them
 */
const MapView: React.FC<MapViewProps> = ({
  shifts,
  onShiftSelect,
  selectedShiftId: propSelectedShiftId,
  className,
  style,
  height = '500px',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(propSelectedShiftId || null);
  const [adBlockerDismissed, setAdBlockerDismissed] = useState(false);
  
  // Use the ad blocker detection hook
  const isAdBlocked = useAdBlockerDetection();
  // Always set to false to hide warnings
  const showAdBlockerWarning = false;
  
  // Update local state when prop changes
  useEffect(() => {
    if (propSelectedShiftId) {
      setSelectedShiftId(propSelectedShiftId);
    }
  }, [propSelectedShiftId]);
  
  // Filter out shifts without location data - with enhanced checking for coordinates
  const shiftsWithLocation = useMemo(() => {
    console.log('Checking shifts for map:', shifts);
    
    if (!shifts || !Array.isArray(shifts)) {
      console.warn('No shifts provided to MapView');
      return [];
    }
    
    return shifts.filter(shift => {
      if (!shift) return false;
      
      // Check for direct latitude/longitude
      if (typeof shift.latitude === 'number' && typeof shift.longitude === 'number') {
        return true;
      }
      
      // Check for Latitude/Longitude (PascalCase)
      if (typeof shift.Latitude === 'number' && typeof shift.Longitude === 'number') {
        return true;
      }
      
      // Check for string lat/lng that can be parsed to numbers
      if (typeof shift.latitude === 'string' && typeof shift.longitude === 'string') {
        const lat = parseFloat(shift.latitude);
        const lng = parseFloat(shift.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          // Modify the shift object to have proper numeric coordinates
          shift.latitude = lat;
          shift.longitude = lng;
          return true;
        }
      }
      
      // Check for string Lat/Lng in PascalCase
      if (typeof shift.Latitude === 'string' && typeof shift.Longitude === 'string') {
        const lat = parseFloat(shift.Latitude);
        const lng = parseFloat(shift.Longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          // Modify the shift object to have proper numeric coordinates
          shift.latitude = lat;
          shift.longitude = lng;
          return true;
        }
      }
      
      // No valid coordinates found
      return false;
    });
  }, [shifts]);
  
  // Filter shifts based on search term
  const filteredShifts = useMemo(() => {
    if (!searchTerm) return shiftsWithLocation;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return shiftsWithLocation.filter(shift => 
      (shift.name && shift.name.toLowerCase().includes(lowerSearchTerm)) ||
      (shift.address && shift.address.toLowerCase().includes(lowerSearchTerm))
    );
  }, [shiftsWithLocation, searchTerm]);
  
  // Handle marker click
  const handleMarkerClick = (shift: Shift) => {
    setSelectedShiftId(shift.id);
    if (onShiftSelect) {
      onShiftSelect(shift.id);
    }
  };
  
  // Render info window content
  const renderInfoContent = (shift: Shift) => {
    return <InfoWindowContent shift={shift} />;
  };
  
  // Handle dismissing the ad blocker warning
  const handleDismissAdBlockerWarning = () => {
    setAdBlockerDismissed(true);
  };
  
  return (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      boxShadow="md"
      position="relative"
    >
      {/* Ad blocker warning disabled */}
      
      <Box p={4} bg="white">
        <Heading size="md" mb={2}>Shifts Map</Heading>
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search shifts by name or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>
      
      <GoogleMap
        shifts={filteredShifts}
        selectedShiftId={selectedShiftId}
        onMarkerClick={handleMarkerClick}
        renderInfoContent={renderInfoContent}
        style={{ height: height }}
        className={className}
      />
      
      <Box p={4} bg="white" maxH="300px" overflowY="auto">
        <Heading size="sm" mb={2}>
          {filteredShifts.length} Shifts Available
        </Heading>
        {filteredShifts.map(shift => (
          <Box 
            key={shift.id} 
            p={2} 
            borderBottom="1px" 
            borderColor="gray.100"
            bg={selectedShiftId === shift.id ? "blue.50" : "white"}
            cursor="pointer"
            onClick={() => {
              setSelectedShiftId(shift.id);
              if (onShiftSelect) {
                onShiftSelect(shift.id);
              }
            }}
            transition="all 0.2s"
            _hover={{ bg: selectedShiftId === shift.id ? "blue.50" : "gray.50" }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">{shift.name}</Text>
                <Text fontSize="sm" color="gray.600">{shift.address}</Text>
              </Box>
              <HStack>
                <Badge colorScheme={shift.stories && shift.stories.length > 0 ? "blue" : "gray"}>
                  {shift.stories ? shift.stories.length : 0} Stories
                </Badge>
              </HStack>
            </Flex>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MapView; 