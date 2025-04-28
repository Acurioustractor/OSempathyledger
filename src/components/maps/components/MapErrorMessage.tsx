import React from 'react';
import { Box, Text, Button, Icon, VStack } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';

interface MapErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * A component to display map loading or initialization errors
 */
const MapErrorMessage: React.FC<MapErrorMessageProps> = ({
  message = 'Failed to load the map. Please check your internet connection and try again.',
  onRetry
}) => {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="white"
      zIndex="1"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <VStack spacing={4} maxW="md" textAlign="center">
        <Icon as={WarningTwoIcon} w={10} h={10} color="red.500" />
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Map Error
        </Text>
        <Text color="gray.600">
          {message}
        </Text>
        {onRetry && (
          <Button 
            colorScheme="blue" 
            onClick={onRetry}
            mt={2}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default MapErrorMessage; 