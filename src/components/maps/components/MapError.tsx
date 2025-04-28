import React from 'react';
import { Box, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface MapErrorProps {
  error: string;
  onRetry: () => void;
}

/**
 * MapError - Component to display map error messages
 */
const MapError: React.FC<MapErrorProps> = ({ error, onRetry }) => {
  return (
    <Box 
      position="absolute"
      bottom={4}
      left={4}
      bg="red.100"
      borderRadius="md"
      p={3}
      zIndex={100}
      boxShadow="md"
      borderWidth={1}
      borderColor="red.300"
      maxW="300px"
    >
      <Alert status="error" variant="subtle" borderRadius="md" bg="transparent" p={0}>
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Map Error</AlertTitle>
          <AlertDescription fontSize="sm">
            {error}
          </AlertDescription>
        </Box>
      </Alert>
      
      <Button 
        size="sm" 
        colorScheme="red" 
        mt={2} 
        onClick={onRetry}
        width="100%"
      >
        Reload Map
      </Button>
    </Box>
  );
};

export default MapError; 