import React from 'react';
import { Box, Text, Button, VStack, HStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface AdBlockerWarningProps {
  onDismiss?: () => void;
  onTryAnyway?: () => void;
  compact?: boolean;
}

/**
 * AdBlockerWarning - A component that warns users about ad blockers interfering with Google Maps
 */
const AdBlockerWarning: React.FC<AdBlockerWarningProps> = ({ 
  onDismiss, 
  onTryAnyway,
  compact = false 
}) => {
  if (compact) {
    return (
      <Alert status="warning" position="absolute" bottom="10px" left="10px" width="auto" maxW="300px" zIndex={10}>
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Ad Blocker Detected</AlertTitle>
          <AlertDescription fontSize="xs">
            Ad blockers can interfere with Google Maps
          </AlertDescription>
          <HStack mt={1} spacing={2}>
            {onTryAnyway && (
              <Button size="xs" colorScheme="blue" onClick={onTryAnyway}>
                Try Anyway
              </Button>
            )}
            {onDismiss && (
              <Button size="xs" variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </HStack>
        </Box>
      </Alert>
    );
  }

  return (
    <Alert 
      status="warning" 
      variant="top-accent"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={6}
      rounded="md"
      maxW="md"
      mx="auto"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Ad Blocker Detected
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        <Text>
          An ad blocker extension appears to be active, which may prevent Google Maps from loading correctly.
        </Text>
        <Text mt={2}>
          For the best experience, consider disabling your ad blocker for this site or adding it to your allowlist.
        </Text>
        <HStack spacing={4} mt={6} justify="center">
          {onTryAnyway && (
            <Button colorScheme="blue" onClick={onTryAnyway}>
              Try Anyway
            </Button>
          )}
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss Warning
            </Button>
          )}
        </HStack>
      </AlertDescription>
    </Alert>
  );
};

export default AdBlockerWarning; 