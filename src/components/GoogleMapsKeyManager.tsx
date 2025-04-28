/**
 * GoogleMapsKeyManager Component
 * 
 * This component provides a UI for setting and managing the Google Maps API key.
 * It allows users to update the API key at runtime without having to reload the entire app.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Heading,
  useToast,
  Tooltip,
  Icon,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  Badge
} from '@chakra-ui/react';
import { InfoIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import googleMapsLoader from '../services/googleMapsLoader';

interface GoogleMapsKeyManagerProps {
  onKeyChanged?: (key: string) => void;
  compact?: boolean;
}

/**
 * GoogleMapsKeyManager Component
 * 
 * @param props Component props
 * @returns React component
 */
const GoogleMapsKeyManager: React.FC<GoogleMapsKeyManagerProps> = ({ 
  onKeyChanged,
  compact = false 
}) => {
  // Get the current API key from the loader
  const [apiKey, setApiKey] = useState<string>(googleMapsLoader.getApiKey());
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get masked API key for display
  const getMaskedKey = (key: string) => {
    if (!key || key.length === 0) {
      return '[No API Key Set]';
    }
    
    if (!showKey) {
      if (key.length <= 8) {
        return '********';
      }
      return key.substring(0, 4) + '••••••' + key.substring(key.length - 4);
    }
    
    return key;
  };

  // Handle API key update
  const handleUpdateKey = async () => {
    if (!newApiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setStatus('loading');
    
    try {
      // Update the API key and reload the maps
      await googleMapsLoader.setApiKey(newApiKey, true);
      
      // Update our local state
      setApiKey(newApiKey);
      setNewApiKey('');
      setStatus('success');
      
      // Call the callback if provided
      if (onKeyChanged) {
        onKeyChanged(newApiKey);
      }
      
      toast({
        title: 'API Key Updated',
        description: 'Google Maps is now using the new API key',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Close the modal if open
      if (isOpen) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      setStatus('error');
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update the API key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If compact, show simplified version
  if (compact) {
    return (
      <Flex alignItems="center" gap={2}>
        <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="md">
          Maps API Key: {getMaskedKey(apiKey)}
        </Badge>
        <Button
          size="xs"
          colorScheme="blue"
          variant="outline"
          onClick={onOpen}
        >
          Change
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Google Maps API Key</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Google Maps API Key</FormLabel>
                <InputGroup>
                  <Input
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter new API key"
                  />
                  <InputRightElement>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowKey(!showKey)}
                    >
                      <Icon as={showKey ? ViewOffIcon : ViewIcon} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  The API key is stored locally in your browser and will be cleared when you refresh the page.
                </FormHelperText>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleUpdateKey}
                isLoading={isLoading}
                loadingText="Updating"
              >
                Update Key
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    );
  }

  // Full version
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <Heading size="md" mb={4}>
        Google Maps API Key
        <Tooltip label="The API key is required for displaying maps and geocoding addresses. It's stored locally in your browser.">
          <InfoIcon ml={2} />
        </Tooltip>
      </Heading>

      <Text mb={4}>
        Current API Key: <strong>{getMaskedKey(apiKey)}</strong>
        <Button
          size="xs"
          variant="ghost"
          ml={2}
          onClick={() => setShowKey(!showKey)}
        >
          <Icon as={showKey ? ViewOffIcon : ViewIcon} />
        </Button>
      </Text>

      <Flex alignItems="flex-end" gap={4}>
        <FormControl>
          <FormLabel>New API Key</FormLabel>
          <Input
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            type={showKey ? 'text' : 'password'}
            placeholder="Enter new Google Maps API key"
          />
        </FormControl>
        <Button
          colorScheme="blue"
          onClick={handleUpdateKey}
          isLoading={isLoading}
          loadingText="Updating"
          mb={2}
        >
          Update Key
        </Button>
      </Flex>

      {status === 'error' && (
        <Text color="red.500" mt={2}>
          Failed to update the API key. Please try again.
        </Text>
      )}

      {status === 'success' && (
        <Text color="green.500" mt={2}>
          API key updated successfully.
        </Text>
      )}
    </Box>
  );
};

export default GoogleMapsKeyManager; 