import React, { useState, useEffect, useMemo } from 'react';
import { Box, Heading, Text, Button, Flex, Badge, HStack, Input, InputGroup, InputLeftElement, Icon } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BasicMap from './BasicMap';

interface Shift {
  id: string;
  Name?: string;
  Address?: string;
  // Add any other properties that shifts might have
}

interface MapViewProps {
  shifts: Shift[];
  onShiftSelect: (shiftId: string) => void;
  selectedShiftId: string | null;
}

/**
 * MapView - A component that shows shifts on a map
 * Uses the simplified BasicMap component to ensure map loads reliably
 */
const MapView: React.FC<MapViewProps> = ({ shifts, onShiftSelect, selectedShiftId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Process shifts to add location data
  const shiftsWithLocation = useMemo(() => {
    return shifts.map(shift => {
      // This is a simplified geocoding approach
      // In a real app, you'd want to use actual geocoding services
      // Here we're just generating sample coordinates around Canberra for the demo
      
      const generateLocation = (shiftId: string) => {
        // Create deterministic "random" locations based on shift ID
        // This ensures the same shift always gets the same location
        let hash = 0;
        for (let i = 0; i < shiftId.length; i++) {
          hash = ((hash << 5) - hash) + shiftId.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        
        // Use the hash to generate a latitude and longitude
        // around the center of Canberra (-35.2809, 149.1300)
        const latOffset = (hash % 1000) / 10000; // Creates a range of about ±0.1 degrees
        const lngOffset = ((hash >> 10) % 1000) / 10000;
        
        return {
          lat: -35.2809 + latOffset,
          lng: 149.1300 + lngOffset
        };
      };
      
      return {
        ...shift,
        location: generateLocation(shift.id)
      };
    });
  }, [shifts]);
  
  // Filter shifts based on search term
  const filteredShifts = useMemo(() => {
    if (!searchTerm) return shiftsWithLocation;
    
    const term = searchTerm.toLowerCase();
    return shiftsWithLocation.filter(shift => 
      (shift.Name && shift.Name.toLowerCase().includes(term)) ||
      (shift.Address && shift.Address.toLowerCase().includes(term))
    );
  }, [shiftsWithLocation, searchTerm]);
  
  return (
    <Box 
      width="100%" 
      borderRadius="md" 
      overflow="hidden" 
      boxShadow="md"
    >
      <BasicMap 
        width="100%" 
        height="500px" 
        center={{ lat: -35.2809, lng: 149.1300 }}
        zoom={11}
        shifts={filteredShifts}
        selectedShiftId={selectedShiftId}
        onShiftSelect={onShiftSelect}
      />
      
      {/* List of shifts below the map */}
      <Box p={4} bg="white">
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Heading size="md">Shifts Locations</Heading>
          <Badge colorScheme="blue">{filteredShifts.length} locations</Badge>
        </Flex>
        
        <Text fontSize="sm" color="gray.600" mb={4}>
          The map above shows the locations of all shifts. 
          Click on a shift below or on the map to view more details.
        </Text>
        
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search shifts by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="gray.50"
          />
        </InputGroup>
        
        <Box 
          maxH="300px" 
          overflowY="auto"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          {filteredShifts.map(shift => (
            <Box 
              key={shift.id}
              p={3}
              borderBottomWidth="1px"
              borderColor="gray.200"
              _last={{ borderBottomWidth: 0 }}
              bg={selectedShiftId === shift.id ? "blue.50" : "white"}
              cursor="pointer"
              onClick={() => onShiftSelect(shift.id)}
              transition="all 0.2s"
              _hover={{ bg: selectedShiftId === shift.id ? "blue.50" : "gray.50" }}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="sm">{shift.Name || 'Unnamed Shift'}</Heading>
                <HStack spacing={2}>
                  <Badge 
                    colorScheme={selectedShiftId === shift.id ? "blue" : "gray"}
                    variant={selectedShiftId === shift.id ? "solid" : "subtle"}
                  >
                    {shift.id}
                  </Badge>
                </HStack>
              </Flex>
              {shift.Address && (
                <Text fontSize="sm" color="gray.600" mt={1}>{shift.Address}</Text>
              )}
            </Box>
          ))}
          
          {filteredShifts.length === 0 && (
            <Box p={4} textAlign="center">
              <Text color="gray.500">
                {shifts.length === 0 
                  ? 'No shifts available' 
                  : 'No shifts match your search criteria'}
              </Text>
            </Box>
          )}
        </Box>
        
        {searchTerm && filteredShifts.length !== shifts.length && (
          <Button 
            size="sm" 
            variant="ghost" 
            colorScheme="blue" 
            mt={2}
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default MapView; 