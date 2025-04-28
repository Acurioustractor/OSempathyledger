import React from 'react';
import { Box, Text, Spinner, Progress } from '@chakra-ui/react';

interface MapLoadingProps {
  progress: number;
  status: string;
}

/**
 * MapLoading - Component to display loading state for the map
 */
const MapLoading: React.FC<MapLoadingProps> = ({ progress, status }) => {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex={10}
      bg="rgba(255,255,255,0.8)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Spinner size="xl" color="blue.500" thickness="4px" mb={4} />
      <Text mb={2} fontWeight="medium">{status}</Text>
      <Progress 
        value={progress} 
        width="80%" 
        colorScheme="blue" 
        borderRadius="md" 
        size="sm" 
        mb={2} 
        hasStripe
        isAnimated
      />
      <Text fontSize="xs" color="gray.500" mb={2}>{progress}%</Text>
    </Box>
  );
};

export default MapLoading; 