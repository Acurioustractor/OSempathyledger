import React from 'react';
import { Box, Spinner, Text, Flex } from '@chakra-ui/react';

interface MapLoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A loading indicator for map components
 */
const MapLoadingIndicator: React.FC<MapLoadingIndicatorProps> = ({
  message = 'Loading map...',
  size = 'xl'
}) => {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.8)"
      zIndex="1"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Flex direction="column" align="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size={size}
          mb={3}
        />
        <Text fontWeight="medium" color="gray.700">
          {message}
        </Text>
      </Flex>
    </Box>
  );
};

export default MapLoadingIndicator; 