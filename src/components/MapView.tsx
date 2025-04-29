import React, { useState, useEffect, useMemo } from 'react';
import { Box, Heading, Text, Button, Flex, Badge, HStack, Input, InputGroup, InputLeftElement, Icon } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import GoogleMap from './maps/GoogleMap';
import InfoWindowContent from './maps/InfoWindowContent';
import { Shift } from '../types/shifts';
import { Story } from '../services/airtable';

interface MapViewProps {
  shifts?: Shift[];
  stories?: Story[];
  onShiftSelect?: (shiftId: string) => void;
  onStorySelect?: (storyId: string) => void;
  selectedShiftId?: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
}

// Helper to parse coordinate strings
const parseCoordinate = (coord: string | number | undefined | null): number | null => {
  if (typeof coord === 'number') return coord;
  if (typeof coord === 'string') {
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

/**
 * MapView Component
 * Displays shifts or stories on a map and allows selecting them
 */
const MapView: React.FC<MapViewProps> = ({
  shifts = [],
  stories = [],
  onShiftSelect,
  onStorySelect,
  selectedShiftId: propSelectedShiftId,
  className,
  style,
  height = '500px',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(propSelectedShiftId || null);
  
  // Update local state when prop changes
  useEffect(() => {
    setSelectedItemId(propSelectedShiftId || null);
  }, [propSelectedShiftId]);
  
  // Convert stories to a structure compatible with the map component (Shift-like)
  const convertedStoriesToMapItems = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    
    console.log('[MapView] Converting stories to map items:', stories.length);
    return stories
      .map(story => {
        let latitude: number | null = null;
        let longitude: number | null = null;

        // 1. Check direct Lat/Lng fields (PascalCase or camelCase)
        latitude = parseCoordinate(story.Latitude ?? (story as any).latitude);
        longitude = parseCoordinate(story.Longitude ?? (story as any).longitude);

        // 2. If no direct coordinates, check Geocode field
        if (latitude === null || longitude === null) {
          if (story.Geocode && typeof story.Geocode === 'string' && story.Geocode.includes(',')) {
            const parts = story.Geocode.split(',');
            const parsedLat = parseCoordinate(parts[0]);
            const parsedLng = parseCoordinate(parts[1]);
            if (parsedLat !== null && parsedLng !== null) {
              latitude = parsedLat;
              longitude = parsedLng;
            } else {
              // console.log(`[MapView] Failed to parse Geocode for story ${story.id}:`, story.Geocode);
            }
          }
        }

        // 3. If still no coordinates, check linked ShiftDetails (if available)
        if ((latitude === null || longitude === null) && (story as any).ShiftDetails) {
          const shiftDetails = (story as any).ShiftDetails as Shift; // Cast to Shift type
          
          // --- START NEW GEOCODE DECODING LOGIC ---
          if (shiftDetails.Geocode && typeof shiftDetails.Geocode === 'string') {
            try {
              const decodedString = atob(shiftDetails.Geocode); // Decode Base64
              const parsedData = JSON.parse(decodedString); // Parse JSON
              
              // Check if parsed data has the expected structure with lat/lng
              if (parsedData && typeof parsedData === 'object' && parsedData.o?.lat && parsedData.o?.lng) {
                const parsedLat = parseCoordinate(parsedData.o.lat);
                const parsedLng = parseCoordinate(parsedData.o.lng);
                
                if (parsedLat !== null && parsedLng !== null) {
                  latitude = parsedLat;
                  longitude = parsedLng;
                  // console.log(`[MapView] Successfully decoded Geocode for story ${story.id}:`, latitude, longitude);
                } else {
                   console.warn(`[MapView] Parsed lat/lng from decoded Geocode are invalid for story ${story.id}:`, parsedData.o.lat, parsedData.o.lng);
                }
              } else {
                 console.warn(`[MapView] Decoded Geocode for story ${story.id} does not have expected format:`, parsedData);
              }
            } catch (error) {
              console.error(`[MapView] Error decoding/parsing Geocode for story ${story.id}:`, error, 'Raw Geocode:', shiftDetails.Geocode);
            }
          } else {
             // console.log(`[MapView] ShiftDetails for story ${story.id} missing Geocode field.`);
          }
          // --- END NEW GEOCODE DECODING LOGIC ---
          
          // Fallback check for direct lat/lng on shift (if decoding failed or wasn't present)
          // This might be removable if Geocode is the only source now.
          if (latitude === null || longitude === null) {
             latitude = parseCoordinate(shiftDetails.latitude ?? shiftDetails.Latitude);
             longitude = parseCoordinate(shiftDetails.longitude ?? shiftDetails.Longitude);
             // if (latitude !== null && longitude !== null) {
             //    console.log(`[MapView] Using direct lat/lng from ShiftDetails for story ${story.id}`);
             // }
          }
        }

        // If we have valid coordinates, create the map item
        if (latitude !== null && longitude !== null) {
          return {
            id: story.id,
            name: story.Title || 'Untitled Story',
            address: story.Location || (story as any)['Location (from Media)'] || 'Unknown Location',
            latitude: latitude,
            longitude: longitude,
            color: story.Themes?.length ? 'blue' : 'gray',
            // Keep a reference to the original story or necessary details
            originalStory: story 
          } as Shift; // Use Shift type for compatibility with GoogleMap component for now
        }
        
        // console.log(`[MapView] Story ${story.id} ('${story.Title}') has no valid coordinates.`);
        return null; // Exclude stories without valid coordinates
      })
      .filter((item): item is Shift => item !== null); // Filter out nulls and type guard
      
  }, [stories]);
  
  // Determine which items to display based on props
  const itemsToDisplay = useMemo(() => {
      return stories.length > 0 ? convertedStoriesToMapItems : shifts;
  }, [stories, shifts, convertedStoriesToMapItems]);
  
  // Filter out items without valid location data (This check might be redundant now)
  const itemsWithLocation = useMemo(() => {
    return itemsToDisplay.filter(item => 
        parseCoordinate(item.latitude ?? item.Latitude) !== null && 
        parseCoordinate(item.longitude ?? item.Longitude) !== null
    );
  }, [itemsToDisplay]);
  
  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return itemsWithLocation;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return itemsWithLocation.filter(item => 
      (item.name && item.name.toLowerCase().includes(lowerSearchTerm)) ||
      (item.address && item.address.toLowerCase().includes(lowerSearchTerm))
    );
  }, [itemsWithLocation, searchTerm]);
  
  // Handle marker click - call the appropriate callback
  const handleMarkerClick = (item: Shift) => { // item is Shift-like
    setSelectedItemId(item.id);
    if (stories.length > 0 && onStorySelect) {
      // If we're showing stories, call onStorySelect with the original story ID
      onStorySelect(item.id);
    } else if (shifts.length > 0 && onShiftSelect) {
      // If we're showing shifts, call onShiftSelect
      onShiftSelect(item.id);
    }
  };
  
  // Render info window content (uses shift prop)
  const renderInfoContent = (item: Shift) => {
    // Pass the item (which is Shift-like) to InfoWindowContent
    return <InfoWindowContent shift={item} />;
  };
  
  // Determine the appropriate heading and context
  const isStoryMode = stories.length > 0;
  const mapTitle = isStoryMode ? 'Stories Map' : 'Shifts Map';
  const searchPlaceholder = `Search ${isStoryMode ? 'stories' : 'shifts'} by name or address`;
  const itemsCount = `${filteredItems.length} ${isStoryMode ? 'Stories' : 'Shifts'} Available`;
  
  return (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      boxShadow="md"
      position="relative"
      style={style}
      className={className}
    >
      <Box p={4} bg="white">
        <Heading size="md" mb={2}>{mapTitle}</Heading>
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>
      
      <GoogleMap
        shifts={filteredItems} 
        selectedShiftId={selectedItemId}
        onMarkerClick={handleMarkerClick}
        renderInfoContent={renderInfoContent}
        style={{ height: height }}
      />
      
      <Box p={4} bg="white" maxH="300px" overflowY="auto">
        <Heading size="sm" mb={2}>
          {itemsCount}
        </Heading>
        {filteredItems.map(item => (
          <Box 
            key={item.id} 
            p={2} 
            borderBottom="1px" 
            borderColor="gray.100"
            bg={selectedItemId === item.id ? "blue.50" : "white"}
            cursor="pointer"
            onClick={() => handleMarkerClick(item)}
            transition="all 0.2s"
            _hover={{ bg: selectedItemId === item.id ? "blue.50" : "gray.50" }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">{item.name}</Text>
                <Text fontSize="sm" color="gray.600">{item.address}</Text>
              </Box>
              <HStack>
                <Badge colorScheme={item.color || (isStoryMode ? "blue" : "gray")}>
                  {isStoryMode ? 'Story' : `${item.stories ? item.stories.length : 0} Stories`}
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