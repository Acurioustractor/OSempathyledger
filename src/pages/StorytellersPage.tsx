import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  SimpleGrid,
  Flex,
  Badge,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useStorytellersData } from '../hooks';
import StorytellersForm from '../components/StorytellersForm';

const StorytellersPage = () => {
  // Use the custom hook for data fetching
  const { 
    storytellers, 
    media, 
    quotes, 
    shifts, 
    isLoading, 
    error, 
    getStorytellersMedia,
    getStorytellersQuotes,
    refetchStorytellers
  } = useStorytellersData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoryteller, setSelectedStoryteller] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Handle form modal opening
  const handleAddStoryteller = () => {
    setSelectedStoryteller(null);
    onOpen();
  };

  const handleEditStoryteller = (storyteller) => {
    setSelectedStoryteller(storyteller);
    onOpen();
  };

  // Filter storytellers based on search
  const filteredStorytellers = storytellers.filter(storyteller => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      storyteller.Name?.toLowerCase().includes(query) ||
      storyteller.Summary?.toLowerCase().includes(query) ||
      storyteller.Location?.toLowerCase().includes(query)
    );
  });

  // Get media count for a storyteller
  const getMediaCount = (storytellerId) => {
    return getStorytellersMedia(storytellerId).length;
  };

  // Get quotes count for a storyteller
  const getQuotesCount = (storytellerId) => {
    return getStorytellersQuotes(storytellerId).length;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Storytellers</Heading>
          <Button colorScheme="blue" onClick={handleAddStoryteller}>
            Add Storyteller
          </Button>
        </HStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search storytellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading storytellers...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            <Text>{error.message}</Text>
          </Alert>
        ) : filteredStorytellers.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No storytellers found</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredStorytellers.map((storyteller) => (
              <Card key={storyteller.id} bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="md">
                <CardHeader>
                  <Flex gap={4}>
                    <Avatar 
                      src={storyteller['File Profile Image']?.[0]?.url || ''}
                      name={storyteller.Name}
                      size="lg"
                    />
                    <Box>
                      <Heading size="md">{storyteller.Name}</Heading>
                      {storyteller.Location && (
                        <Text color="gray.500" fontSize="sm">{storyteller.Location}</Text>
                      )}
                      {storyteller.Role && (
                        <Badge colorScheme="blue" mt={1}>{storyteller.Role}</Badge>
                      )}
                    </Box>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  {storyteller.Summary && (
                    <Text noOfLines={3}>{storyteller.Summary}</Text>
                  )}
                  <HStack mt={4} fontSize="sm" spacing={4}>
                    <Badge colorScheme="green">{getMediaCount(storyteller.id)} Media</Badge>
                    <Badge colorScheme="purple">{getQuotesCount(storyteller.id)} Quotes</Badge>
                  </HStack>
                </CardBody>
                <CardFooter pt={0}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    width="full"
                    onClick={() => handleEditStoryteller(storyteller)}
                  >
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Form modal for adding/editing storytellers */}
      <StorytellersForm 
        isOpen={isOpen}
        onClose={onClose}
        storyteller={selectedStoryteller}
        onSuccess={() => {
          refetchStorytellers();
          onClose();
        }}
      />
    </Container>
  );
};

export default StorytellersPage; 