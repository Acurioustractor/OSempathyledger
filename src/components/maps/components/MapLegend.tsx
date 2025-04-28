import React from 'react';
import { Box, Heading, Flex, Text } from '@chakra-ui/react';

/**
 * MapLegend - Component to display the map legend
 */
const MapLegend: React.FC = () => {
  return (
    <Box 
      position="absolute" 
      right={4} 
      top={4} 
      bg="white"
      boxShadow="md" 
      borderRadius="md"
      p={3}
      zIndex={10}
    >
      <Heading size="xs" mb={2}>Legend</Heading>
      <Flex align="center" mb={2}>
        <Box w={3} h={3} borderRadius="full" bg="#38A169" mr={2} />
        <Text fontSize="sm">Many stories</Text>
      </Flex>
      <Flex align="center" mb={2}>
        <Box w={3} h={3} borderRadius="full" bg="#DD6B20" mr={2} />
        <Text fontSize="sm">Some stories</Text>
      </Flex>
      <Flex align="center">
        <Box w={3} h={3} borderRadius="full" bg="#A0AEC0" mr={2} />
        <Text fontSize="sm">No stories</Text>
      </Flex>
    </Box>
  );
};

export default MapLegend; 