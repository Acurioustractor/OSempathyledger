import React from 'react';
import { Box, Text, Button, Flex, Heading, Link } from '@chakra-ui/react';

interface AdBlockerWarningProps {
  compact?: boolean;
  onDismiss?: () => void;
  onTryAnyway?: () => void;
}

/**
 * AdBlockerWarning - Component to warn users about ad blockers
 * that might interfere with Google Maps loading
 * 
 * Currently disabled to avoid false positives
 */
const AdBlockerWarning: React.FC<AdBlockerWarningProps> = ({ 
  compact = false,
  onDismiss,
  onTryAnyway
}) => {
  // Disable this component completely
  return null;

  /* Original implementation disabled
  if (compact) {
    return (
      <Box 
        position="absolute"
        top={4}
        right={4}
        zIndex={10}
        bg="yellow.100"
        p={3}
        borderRadius="md"
        boxShadow="sm"
        maxWidth="300px"
        fontSize="sm"
        borderWidth="1px"
        borderColor="yellow.300"
      >
        <Text fontWeight="bold" mb={1}>Ad Blocker Detected</Text>
        <Text fontSize="xs" mb={2}>
          Your ad blocker may interfere with Google Maps. If the map doesn't load properly,
          try disabling your ad blocker for this site.
        </Text>
        {onDismiss && (
          <Button 
            size="xs" 
            colorScheme="yellow" 
            variant="outline" 
            width="100%"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box 
      borderWidth={1} 
      borderColor="yellow.300"
      bg="yellow.50" 
      p={4} 
      borderRadius="md"
      boxShadow="md"
      maxW="600px"
      mx="auto"
      my={4}
    >
      <Heading size="md" color="yellow.700" mb={3}>
        Ad Blocker Detected
      </Heading>
      
      <Text mb={4}>
        We've detected that you're using an ad blocker or privacy extension 
        that may interfere with Google Maps functionality. To ensure the map 
        works correctly, please:
      </Text>
      
      <Box pl={4} mb={4}>
        <Text mb={2}>• Disable your ad blocker for this site</Text>
        <Text mb={2}>• Allow access to maps.googleapis.com domain</Text>
        <Text mb={2}>• Check your browser's content blocking settings</Text>
      </Box>
      
      <Text fontSize="sm" mb={4}>
        Maps functionality requires access to Google's servers. We respect your 
        privacy and only use Google Maps for displaying location data.
      </Text>
      
      <Flex justifyContent="space-between" flexWrap="wrap" gap={2}>
        {onTryAnyway && (
          <Button
            colorScheme="yellow"
            onClick={onTryAnyway}
          >
            Try Loading Map Anyway
          </Button>
        )}
        
        {onDismiss && (
          <Button
            variant="outline"
            onClick={onDismiss}
          >
            Dismiss Warning
          </Button>
        )}
        
        <Link 
          href="https://support.google.com/maps/answer/9773978" 
          isExternal 
          color="blue.500"
          alignSelf="center"
          fontSize="sm"
        >
          Learn More
        </Link>
      </Flex>
    </Box>
  );
  */
};

export default AdBlockerWarning; 